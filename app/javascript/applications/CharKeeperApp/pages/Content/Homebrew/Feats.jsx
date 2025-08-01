import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartFeatForm, DaggerheartFeat } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewFeatRequest } from '../../../requests/createHomebrewFeatRequest';
import { removeHomebrewFeatRequest } from '../../../requests/removeHomebrewFeatRequest';

export const HomebrewFeats = (props) => {
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelCreatingFeat = () => setActiveView('left');

  const createFeat = async (payload) => {
    const result = await createHomebrewFeatRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        props.addHomebrew('feats', result.feat);
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const removeFeat = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewFeatRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) props.removeHomebrew('feats', id);
    else renderAlerts(result.errors);
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newFeat`)}
            </Button>
            <Show when={props.homebrews !== undefined}>
              <For each={props.homebrews.feats}>
                {(feat) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{feat.title[locale()]}</p>
                      <IconButton onClick={(e) => removeFeat(e, feat.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartFeat feat={feat} homebrews={props.homebrews} />
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
                <NewDaggerheartFeatForm homebrews={props.homebrews} onSave={createFeat} onCancel={cancelCreatingFeat} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
