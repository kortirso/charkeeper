import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartClassForm, DaggerheartClass } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewClassRequest } from '../../../requests/createHomebrewClassRequest';
import { removeHomebrewClassRequest } from '../../../requests/removeHomebrewClassRequest';

export const HomebrewClasses = (props) => {
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelCreatingClass = () => setActiveView('left');

  const createClass = async (payload) => {
    const result = await createHomebrewClassRequest(appState.accessToken, props.provider, payload);

    if (result.errors_list === undefined) {
      batch(() => {
        props.addHomebrew('classes', result.speciality);
        setActiveView('left');
      });
    } else renderAlerts(result.errors_list);
  }

  const removeClass = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewClassRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('classes', id);
    else renderAlerts(result.errors_list);
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newClass`)}
            </Button>
            <Show when={props.homebrews !== undefined}>
              <For each={props.homebrews.classes}>
                {(item) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{item.name}</p>
                      <IconButton onClick={(e) => removeClass(e, item.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartClass homebrews={props.homebrews} item={item} />
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
                <NewDaggerheartClassForm homebrews={props.homebrews} onSave={createClass} onCancel={cancelCreatingClass} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
