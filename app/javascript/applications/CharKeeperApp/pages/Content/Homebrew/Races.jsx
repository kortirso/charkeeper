import { createSignal, createEffect, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartRaceForm, DaggerheartRace } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewRacesRequest } from '../../../requests/fetchHomebrewRacesRequest';
import { createHomebrewRaceRequest } from '../../../requests/createHomebrewRaceRequest';

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

  const createRace = async (payload) => {
    const result = await createHomebrewRaceRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        setRaces(races().concat(result.race));
        setActiveView('left');
      });
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
                      <IconButton onClick={() => null}>
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
                <NewDaggerheartRaceForm onSave={createRace} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
