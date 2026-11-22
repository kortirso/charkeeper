import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import { readFromCache, writeToCache } from '../helpers';

const AppStateContext = createContext();

const CHARKEEPER_ACCESS_TOKEN = 'CharKeeperAccessToken';
const COLOR_SCHEMA = 'ColorSchema';
const SHOW_NAVIGATION = 'ShowNavigation';

export const StateProvider = (props) => {
  const [appState, setAppState] = createStore({
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    colorSchema: props.colorSchema || readFromCache(COLOR_SCHEMA) || 'light', // eslint-disable-line solid/reactivity
    colorTheme: props.colorTheme || 'crimson', // eslint-disable-line solid/reactivity
    providerLocales: props.providerLocales || {}, // eslint-disable-line solid/reactivity
    isAdmin: props.isAdmin || false, // eslint-disable-line solid/reactivity
    username: props.username, // eslint-disable-line solid/reactivity
    unreadNotificationsCount: undefined,
    identities: props.identities, // eslint-disable-line solid/reactivity
    oauthLinks: props.oauthLinks, // eslint-disable-line solid/reactivity
    oauthCredentials: props.oauthCredentials, // eslint-disable-line solid/reactivity
    initialized: false,
    rootHost: props.host || 'charkeeper.org' // eslint-disable-line solid/reactivity
  });

  const setStatusBarColor = async (value) => await window.__TAURI__.core.invoke('plugin:m3|bar_color', { color: value });

  const deviceInsets = async () => {
    const result = await window.__TAURI__.core.invoke('plugin:m3|insets');
    const bodyElement = document.getElementById('charkeeper_app_body');
    bodyElement.style.paddingTop = `${result.adjustedInsetTop}px`;
    bodyElement.style.paddingBottom = `${result.adjustedInsetBottom}px`;
  }

  const readAccessTokenFromCache = async () => {
    const stateValue = await readFromCache(CHARKEEPER_ACCESS_TOKEN);
    if (stateValue === null || stateValue === undefined) {
      return setAppState({ ...appState, initialized: true });
    }

    setAppState({ ...appState, accessToken: stateValue, initialized: true });
  }

  createEffect(() => {
    if (appState.accessToken !== undefined) return;

    readAccessTokenFromCache();
  });

  createEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;

    if (appState.colorSchema === 'dark') {
      setStatusBarColor('light');
    } else {
      setStatusBarColor('dark');
    }
  });

  createEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;

    const { platform } = window.__TAURI__.os;
    if (platform() !== 'android') return;

    deviceInsets();
  });

  const store = [
    appState,
    {
      changeUserInfo(payload) {
        if (payload.colorSchema) writeToCache(COLOR_SCHEMA, payload.colorSchema);
        if (payload.showNavigation) writeToCache(SHOW_NAVIGATION, payload.showNavigation);
        setAppState({ ...appState, ...payload });
      },
      setAccessToken(value) {
        writeToCache(CHARKEEPER_ACCESS_TOKEN, value);
        setAppState({ ...appState, accessToken: value });
      },
      changeUnreadNotificationsCount(value) {
        setAppState({ ...appState, unreadNotificationsCount: value });
      }
    }
  ];

  return (
    <AppStateContext.Provider value={store}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState() { return useContext(AppStateContext); }
