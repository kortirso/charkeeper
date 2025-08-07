import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartSubclassForm, DaggerheartSubclass } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewSubclassRequest } from '../../../requests/createHomebrewSubclassRequest';
import { removeHomebrewSubclassRequest } from '../../../requests/removeHomebrewSubclassRequest';

export const HomebrewSubclasses = (props) => {
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
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

  const removeSubclass = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewSubclassRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) props.removeHomebrew('subclasses', id);
    else renderAlerts(result.errors);
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
