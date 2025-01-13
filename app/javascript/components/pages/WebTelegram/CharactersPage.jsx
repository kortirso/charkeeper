import { createEffect, For } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Character } from '../../../components';

import { useAppState } from '../../../context/appState';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';
import { fetchRulesRequest } from '../../../requests/fetchRulesRequest';

export const CharactersPage = (props) => {
  const [pageState, setPageState] = createStore({
    rules: [],
    characters: []
  });

  const [appState] = useAppState();

  createEffect(() => {
    if (pageState.rules.length !== 0) return;

    const fetchRules = async () => await fetchRulesRequest(appState.accessToken);
    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchRules(), fetchCharacters()]).then(
      ([rulesData, charactersData]) => {
        setPageState({
          ...pageState,
          rules: rulesData.rules,
          characters: charactersData.characters
        });
      }
    );
  });

  // 453x750
  // 420x690
  return (
    <div>
      <For each={pageState.characters}>
        {(character) =>
          <Character
            currentRule={pageState.rules.find((item) => item.id === character.rule_id).name}
            character={character}
          />
        }
      </For>
    </div>
  );
}
