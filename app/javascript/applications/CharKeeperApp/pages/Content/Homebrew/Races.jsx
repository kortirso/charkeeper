import { createSignal, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartRaceForm, DaggerheartRace } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { createHomebrewRaceRequest } from '../../../requests/createHomebrewRaceRequest';
import { removeHomebrewRaceRequest } from '../../../requests/removeHomebrewRaceRequest';

export const HomebrewRaces = (props) => {
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const cancelCreatingRace = () => setActiveView('left');

  const createRace = async (payload) => {
    const result = await createHomebrewRaceRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        props.addHomebrew('races', result.race);
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const removeRace = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewRaceRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) props.removeHomebrew('races', id);
    else renderAlerts(result.errors);
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newRace`)}
            </Button>
            <Show when={props.homebrews !== undefined}>
              <For each={props.homebrews.races}>
                {(race) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{race.name}</p>
                      <IconButton onClick={(e) => removeRace(e, race.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartRace raceId={race.id} feats={props.homebrews.feats} />
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
                <NewDaggerheartRaceForm onSave={createRace} onCancel={cancelCreatingRace} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
