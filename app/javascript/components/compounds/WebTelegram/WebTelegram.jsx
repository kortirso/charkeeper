import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState } from '../../../context/appState';

import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';
import { fetchRulesRequest } from '../../../requests/fetchRulesRequest';

export const WebTelegram = (props) => {
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
    <div class="flex-1 flex flex-col justify-center items-center bg-white">
      123
    </div>
  );
}
