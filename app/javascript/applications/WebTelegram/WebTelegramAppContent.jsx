import { createEffect, Switch, Match, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { CharactersPage, CharacterPage, NpcPage, ProfilePage } from './components';
import { useAppState, useAppLocale } from './context';
import { useTelegram } from './hooks';

import { fetchAccessTokenRequest } from './requests/fetchAccessTokenRequest';

export const WebTelegramAppContent = () => {
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
    <Switch fallback={
      <div class="h-screen flex justify-center items-center">
        <div>{t('loading')}</div>
      </div>
    }>
      <Match when={appState.accessToken !== undefined && appState.accessToken !== null}>
        <div class="flex-1 flex flex-col bg-gray-50 h-screen">
          <section class="w-full flex-1 flex flex-col overflow-hidden">
            <Switch>
              <Match when={appState.activePage === 'characters' && Object.keys(appState.activePageParams).length === 0}>
                <CharactersPage />
              </Match>
              <Match when={appState.activePage === 'characters' && appState.activePageParams.id}>
                <CharacterPage />
              </Match>
              <Match when={appState.activePage === 'npc'}>
                <NpcPage />
              </Match>
              <Match when={appState.activePage === 'profile'}>
                <ProfilePage />
              </Match>
            </Switch>
          </section>
          <nav class="w-full flex p-4 bg-white border-t border-gray-200">
            <div class="nav-button" onClick={() => navigate('characters', {})}>
              <div class={`nav-button-icon ${appState.activePage === 'characters' ? 'border-black' : 'border-gray'}`} />
              <p class="nav-button-text">{t('nav.characters')}</p>
            </div>
            <div class="nav-button" onClick={() => navigate('npc', {})}>
              <div class={`nav-button-icon ${appState.activePage === 'npc' ? 'border-black' : 'border-gray'}`} />
              <p class="nav-button-text">{t('nav.npc')}</p>
            </div>
            <div class="nav-button" onClick={() => navigate('profile', {})}>
              <div class={`nav-button-icon ${appState.activePage === 'profile' ? 'border-black' : 'border-gray'}`} />
              <p class="nav-button-text">{t('nav.profile')}</p>
            </div>
          </nav>
        </div>
      </Match>
    </Switch>
  );
}
