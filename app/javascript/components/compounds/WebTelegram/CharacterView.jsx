import { createEffect, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Dnd5 } from '../../../components';

import { useAppState } from '../../../context';

import { fetchCharacterRequest } from '../../../requests/fetchCharacterRequest';

export const CharacterView = (props) => {
  const [pageState, setPageState] = createStore({
    character: {}
  });

  const [appState, { navigate }] = useAppState();

  createEffect(() => {
    if (appState.activePageParams.id === pageState.character.user_character_id) return;

    const fetchCharacter = async () => await fetchCharacterRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacter()]).then(
      ([characterData]) => {
        setPageState({
          ...pageState,
          character: characterData.character
        });
      }
    );
  });

  return (
    <Switch>
      <Match when={pageState.character.provider === 'D&D 5'}>
        <Dnd5 character={pageState.character} />
      </Match>
    </Switch>
  );
}
