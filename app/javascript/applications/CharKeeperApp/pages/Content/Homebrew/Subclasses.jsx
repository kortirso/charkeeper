import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartSubclassForm, DaggerheartSubclass } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewSubclassRequest } from '../../../requests/createHomebrewSubclassRequest';
import { removeHomebrewSubclassRequest } from '../../../requests/removeHomebrewSubclassRequest';
import { copyHomebrewSubclassRequest } from '../../../requests/copyHomebrewSubclassRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewSubclasses = (props) => {
  const [activeView, setActiveView] = createSignal('left');
  const [copySubclassId, setCopySubclassId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice, renderAlert }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelCreatingSubclass = () => setActiveView('left');

  const createSubclass = async (payload) => {
    const result = await createHomebrewSubclassRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        props.addHomebrew('subclasses', result.subclass);
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const copySubclass = async () => {
    const result = await copyHomebrewSubclassRequest(appState.accessToken, props.provider, copySubclassId());

    if (result.errors === undefined) props.reloadHomebrews();
    else renderAlert(result.errors);
  }

  const removeSubclass = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewSubclassRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) props.removeHomebrew('subclasses', id);
    else renderAlerts(result.errors);
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newSubclass`)}
            </Button>
            <div class="flex mb-2">
              <Button default size="small" classList="px-2" onClick={copySubclass}>
                {t('copy')}
              </Button>
              <Input
                containerClassList="ml-2 flex-1"
                placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
                value={copySubclassId()}
                onInput={(value) => setCopySubclassId(value)}
              />
            </div>
            <Show when={props.homebrews !== undefined}>
              <For each={props.homebrews.subclasses}>
                {(item) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{item.name}</p>
                      <IconButton onClick={(e) => removeSubclass(e, item.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartSubclass homebrews={props.homebrews} item={item} />
                      </Match>
                    </Switch>
                    <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(item.id)}>
                      COPY
                    </p>
                  </Toggle>
                }
              </For>
            </Show>
          </>
        }
        rightView={
          <Show when={activeView() === 'right'}>
            <Switch>
              <Match when={props.provider === 'daggerheart'}>
                <NewDaggerheartSubclassForm homebrews={props.homebrews} onSave={createSubclass} onCancel={cancelCreatingSubclass} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
