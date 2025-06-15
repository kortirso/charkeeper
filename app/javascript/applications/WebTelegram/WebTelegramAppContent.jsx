import { createEffect, Show, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { CharactersPage, CharacterPage } from './components';
import { useAppState, useAppLocale } from './context';
import { useTelegram } from './hooks';

import { fetchAccessTokenRequest } from './requests/fetchAccessTokenRequest';

export const WebTelegramAppContent = () => {
  const size = createWindowSize();
  const { webApp } = useTelegram();

  const [appState, { setAccessToken, navigate }] = useAppState();
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
          });
        } else {
          setAccessToken(null);
        }
      }
    );
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
            fallback={<CharacterPage onNavigate={() => navigate('characters', {})} />}
          >
            <Match when={size.width >= 768}>
              <CharactersPage onNavigate={() => navigate('profile', {})} />
              <CharacterPage onNavigate={() => navigate('characters', {})} />
            </Match>
            <Match when={Object.keys(appState.activePageParams).length === 0}>
              <CharactersPage onNavigate={() => navigate('profile', {})} />
            </Match>
          </Switch>
          {/*<Match when={appState.activePage === 'profile'}>
            <ProfilePage
              onNavigate={() => navigate('characters', {})}
            />
          </Match>*/}
        </section>
      </div>
    </Show>
  );
}
