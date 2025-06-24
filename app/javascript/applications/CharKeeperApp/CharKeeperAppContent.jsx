import { createEffect, createMemo, Show, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { NavigationPage, ContentPage } from './pages';
import { useAppState, useAppLocale } from './context';
import { useTelegram } from './hooks';

import { fetchAccessTokenRequest } from './requests/fetchAccessTokenRequest';

export const CharKeeperAppContent = () => {
  const size = createWindowSize();
  const { webApp } = useTelegram();

  const [appState, { setAccessToken, changeUsername, navigate }] = useAppState();
  const [, dict, { setLocale }] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (appState.accessToken !== undefined) return;

    const urlSearchParams = new URLSearchParams(webApp.initData);
    const data = Object.fromEntries(urlSearchParams.entries());
    const checkString = Object.keys(data).filter(key => key !== 'hash').map(key => `${key}=${data[key]}`).sort().join('\n');

    // webApp.initDataUnsafe.user
    // {
    //   "id": 11110000,
    //   "first_name": "",
    //   "last_name": "",
    //   "username": "kortirso",
    //   "language_code": "ru",
    //   "allows_write_to_pm": true,
    //   "photo_url": ""
    // }

    const fetchAccessToken = async () => await fetchAccessTokenRequest(checkString, data.hash);

    Promise.all([fetchAccessToken()]).then(
      ([accessTokenData]) => {
        if (accessTokenData.access_token) {
          batch(() => {
            setLocale(accessTokenData.locale);
            setAccessToken(accessTokenData.access_token);
            changeUsername(accessTokenData.username);
          });
        } else {
          setAccessToken(null);
        }
      }
    );
  });

  const navigationPage = createMemo(() => {
    if (appState.accessToken === undefined) return <></>;

    return <NavigationPage />;
  });

  // 453x750
  // 420x690
  return (
    <Show
      when={appState.accessToken !== undefined && appState.accessToken !== null}
      fallback={
        <div class="h-screen flex justify-center items-center">
          <div>{t('loading')}</div>
        </div>
      }
    >
      <div class="flex-1 flex flex-col bg-gray-50 h-screen">
        <section class="w-full flex-1 flex overflow-hidden">
          <Switch
            fallback={<ContentPage onNavigate={() => navigate(null, {})} />}
          >
            <Match when={size.width >= 768}>
              {navigationPage()}
              <ContentPage />
            </Match>
            <Match when={appState.activePage === null}>
              {navigationPage()}
            </Match>
          </Switch>
        </section>
      </div>
    </Show>
  );
}
