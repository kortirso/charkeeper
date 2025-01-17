import { createEffect, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Dnd5 } from '../../../components';

import { useAppState } from '../../../context';

import { fetchCharacterRequest } from '../../../requests/fetchCharacterRequest';
import { fetchCharacterItemsRequest } from '../../../requests/fetchCharacterItemsRequest';

export const CharacterView = (props) => {
  const [pageState, setPageState] = createStore({
    character: {},
    characterItems: [],
    currentRule: null
  });

  const [appState, { navigate }] = useAppState();

  createEffect(() => {
    if (appState.activePageParams.id === pageState.character.id) return;

    const fetchCharacter = async () => await fetchCharacterRequest(appState.accessToken, appState.activePageParams.id);
    const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacter(), fetchCharacterItems()]).then(
      ([characterData, characterItemsData]) => {
        setPageState({
          ...pageState,
          character: characterData.character,
          characterItems: characterItemsData.items,
          currentRule: appState.rules.find((item) => item.id === characterData.character.rule_id).name
        });
      }
    );
  });

  return (
    <Switch>
      <Match when={pageState.currentRule === 'D&D 5'}>
        <Dnd5 character={pageState.character} characterItems={pageState.characterItems} />
      </Match>
    </Switch>
  );
}
