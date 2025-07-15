import { createSignal, createEffect, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartRaceForm, DaggerheartRace } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewRacesRequest } from '../../../requests/fetchHomebrewRacesRequest';
import { createHomebrewRaceRequest } from '../../../requests/createHomebrewRaceRequest';
import { removeHomebrewRaceRequest } from '../../../requests/removeHomebrewRaceRequest';

export const HomebrewRaces = (props) => {
  const [races, setRaces] = createSignal(undefined);
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (races() !== undefined) return;

    const fetchRaces = async () => await fetchHomebrewRacesRequest(appState.accessToken, props.provider);

    Promise.all([fetchRaces()]).then(
      ([racesData]) => {
        if (racesData.errors) setRaces([]);
        else setRaces(racesData.races);
      }
    );
  });

  const cancenCreatingRace = () => setActiveView('left');

  const createRace = async (payload) => {
    const result = await createHomebrewRaceRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        setRaces(races().concat(result.race));
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const removeRace = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewRaceRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) {
      setRaces(races().filter((item) => item.id !== id));
    } else renderAlerts(result.errors);
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
            <Show when={races() !== undefined}>
              <For each={races()}>
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
                        <DaggerheartRace race={race} />
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
                <NewDaggerheartRaceForm onSave={createRace} onCancel={cancenCreatingRace} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
