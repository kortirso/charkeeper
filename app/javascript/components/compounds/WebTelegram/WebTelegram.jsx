import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useTelegram } from '../../../hooks';

import { fetchAccessTokenRequest } from '../../../requests/fetchAccessTokenRequest';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';
import { fetchRulesRequest } from '../../../requests/fetchRulesRequest';

export const WebTelegram = (props) => {
  const [pageState, setPageState] = createStore({
    accessToken: undefined,
    rules: [],
    characters: []
  });

  const { webApp } = useTelegram();

  createEffect(() => {
    if (pageState.accessToken !== undefined && pageState.accessToken !== null) return;

    const urlSearchParams = new URLSearchParams(webApp.initData);
    const data = Object.fromEntries(urlSearchParams.entries());
    const checkString = Object.keys(data).filter(key => key !== 'hash').map(key => `${key}=${data[key]}`).sort().join('\n');

    const fetchAccessToken = async () => await fetchAccessTokenRequest(checkString, data.hash);

    Promise.all([fetchAccessToken()]).then(
      ([accessTokenData]) => {
        if (accessTokenData.access_token) {
          setPageState({
            ...pageState,
            accessToken: accessTokenData.access_token
          });
        } else {
          setPageState({
            ...pageState,
            accessToken: null
          });
        }
      }
    );
  });

  createEffect(() => {
    if (pageState.accessToken === undefined || pageState.accessToken === null) return;
    if (pageState.rules.length !== 0) return;

    const fetchRules = async () => await fetchRulesRequest(pageState.accessToken);
    const fetchCharacters = async () => await fetchCharactersRequest(pageState.accessToken);

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

  return (
    <p>
      123
    </p>
  );
}
