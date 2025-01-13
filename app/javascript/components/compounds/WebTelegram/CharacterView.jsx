import { createEffect, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Dnd5 } from '../../../components';

import { useAppState } from '../../../context/appState';

import { fetchCharacterRequest } from '../../../requests/fetchCharacterRequest';

export const CharacterView = (props) => {
  const [pageState, setPageState] = createStore({
    character: {},
    currentRule: null
  });

  const [appState, { navigate }] = useAppState();

  createEffect(() => {
    if (appState.activePageParams.id === pageState.character.id) return;

    const fetchCharacter = async () => await fetchCharacterRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacter()]).then(
      ([characterData]) => {
        setPageState({
          ...pageState,
          character: characterData.character,
          currentRule: appState.rules.find((item) => item.id === characterData.character.rule_id).name
        });
      }
    );
  });

  return (
    <Switch>
      <Match when={pageState.currentRule === 'D&D 5'}>
        <Dnd5 character={pageState.character} />
      </Match>
    </Switch>
  );
}
