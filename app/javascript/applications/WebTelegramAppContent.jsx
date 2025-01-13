import { createEffect, Switch, Match, createMemo } from 'solid-js';

import { CharactersPage, NpcPage, LibraryPage, ProfilePage } from '../components';

import { useAppState } from '../context/appState';
import { useTelegram } from '../hooks';

import { fetchAccessTokenRequest } from '../requests/fetchAccessTokenRequest';

export const WebTelegramAppContent = (props) => {
  const { webApp } = useTelegram();
  const [appState, { setAccessToken, setActivePage }] = useAppState();

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

  const charactersPage = createMemo(() => <CharactersPage />);
  const npcPage = createMemo(() => <NpcPage />);
  const libraryPage = createMemo(() => <LibraryPage />);
  const profilePage = createMemo(() => <ProfilePage />);

  // 453x750
  // 420x690
  return (
    <Switch fallback={
      <div class="flex-1 flex flex-col justify-center items-center bg-white">
        <div>Loading screen</div>
      </div>
    }>
      <Match when={appState.accessToken !== undefined && appState.accessToken !== null}>
        <div class="flex-1 flex flex-col justify-center items-center bg-white">
          <div class="w-full flex justify-between mb-4 py-4 border-b border-gray">
            <p class="flex-1 text-center">Page title</p>
          </div>
          <section class="w-full flex-1">
            <Switch>
              <Match when={appState.activePage === 'Characters'}>
                {charactersPage()}
              </Match>
              <Match when={appState.activePage === 'NPC'}>
                {npcPage()}
              </Match>
              <Match when={appState.activePage === 'Library'}>
                {libraryPage()}
              </Match>
              <Match when={appState.activePage === 'Profile'}>
                {profilePage()}
              </Match>
            </Switch>
          </section>
          <nav class="w-full flex p-4">
            <div class="flex-1 flex flex-col items-center" onClick={() => setActivePage('Characters')}>
              <div class={`w-8 h-8 border-2 ${appState.activePage === 'Characters' ? 'border-black' : 'border-gray'} rounded-lg mb-1`}></div>
              <p class="text-center text-xs uppercase">Characters</p>
            </div>
            <div class="flex-1 flex flex-col items-center" onClick={() => setActivePage('NPC')}>
              <div class={`w-8 h-8 border-2 ${appState.activePage === 'NPC' ? 'border-black' : 'border-gray'} rounded-lg mb-1`}></div>
              <p class="text-center text-xs uppercase">NPC</p>
            </div>
            <div class="flex-1 flex flex-col items-center" onClick={() => setActivePage('Library')}>
              <div class={`w-8 h-8 border-2 ${appState.activePage === 'Library' ? 'border-black' : 'border-gray'} rounded-lg mb-1`}></div>
              <p class="text-center text-xs uppercase">Library</p>
            </div>
            <div class="flex-1 flex flex-col items-center" onClick={() => setActivePage('Profile')}>
              <div class={`w-8 h-8 border-2 ${appState.activePage === 'Profile' ? 'border-black' : 'border-gray'} rounded-lg mb-1`}></div>
              <p class="text-center text-xs uppercase">Profile</p>
            </div>
          </nav>
        </div>
      </Match>
    </Switch>
  );
}
