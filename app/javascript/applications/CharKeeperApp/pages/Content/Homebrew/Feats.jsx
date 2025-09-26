import { createSignal, createEffect, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartFeatForm, DaggerheartFeat } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewFeatRequest } from '../../../requests/createHomebrewFeatRequest';
import { removeHomebrewFeatRequest } from '../../../requests/removeHomebrewFeatRequest';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';

export const HomebrewFeats = (props) => {
  const [characters, setCharacters] = createSignal(undefined);
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (characters() !== undefined) return;

    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchCharacters()]).then(
      ([charactersData]) => {
        setCharacters(charactersData.characters);
      }
    );
  });

  const cancelCreatingFeat = () => setActiveView('left');

  const createFeat = async (payload) => {
    const result = await createHomebrewFeatRequest(appState.accessToken, props.provider, payload);

    if (result.errors_list === undefined) {
      batch(() => {
        props.addHomebrew('feats', result.feat);
        setActiveView('left');
      });
    } else renderAlerts(result.errors_list);
  }

  const removeFeat = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewFeatRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) props.removeHomebrew('feats', id);
    else renderAlerts(result.errors_list);
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
                        <DaggerheartFeat feat={feat} characters={characters()} homebrews={props.homebrews} />
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
                <NewDaggerheartFeatForm
                  homebrews={props.homebrews}
                  characters={characters()}
                  onSave={createFeat}
                  onCancel={cancelCreatingFeat}
                />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
