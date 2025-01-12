import { createEffect, Switch, Match } from 'solid-js';

import { WebTelegram } from '../components';

import { useAppState } from '../context/appState';
import { useTelegram } from '../hooks';

import { fetchAccessTokenRequest } from '../requests/fetchAccessTokenRequest';

export const WebTelegramAppContent = (props) => {
  const { webApp } = useTelegram();
  const [appState, { setAccessToken }] = useAppState();

  createEffect(() => {
    if (appState.accessToken !== undefined) return;

    const urlSearchParams = new URLSearchParams(webApp.initData);
    const data = Object.fromEntries(urlSearchParams.entries());
    const checkString = Object.keys(data).filter(key => key !== 'hash').map(key => `${key}=${data[key]}`).sort().join('\n');

    const fetchAccessToken = async () => await fetchAccessTokenRequest(checkString, data.hash);

    Promise.all([fetchAccessToken()]).then(
      ([accessTokenData]) => {
        if (accessTokenData.access_token) {
          setAccessToken(accessTokenData.access_token)
        } else {
          setAccessToken(null)
        }
      }
    );
  });

  // 453x750
  // 420x690
  return (
    <Switch fallback={
      <div class="flex-1 flex flex-col justify-center items-center bg-white">
        <div>Loading screen</div>
      </div>
    }>
      <Match when={appState.accessToken !== undefined && appState.accessToken !== null}>
        <WebTelegram />
      </Match>
    </Switch>
  );
}
