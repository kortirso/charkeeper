import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

import { readFromCache, writeToCache } from '../helpers';

const AppStateContext = createContext();

const CHARKEEPER_ACCESS_TOKEN = 'CharKeeperAccessToken';
const COLOR_SCHEMA = 'ColorSchema';

export const AppStateProvider = (props) => {
  const [appState, setAppState] = createStore({
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    colorSchema: props.colorSchema || readFromCache(COLOR_SCHEMA) || 'light', // eslint-disable-line solid/reactivity
    isAdmin: props.isAdmin || false, // eslint-disable-line solid/reactivity
    username: props.username, // eslint-disable-line solid/reactivity
    activePage: null,
    activePageParams: {},
    unreadNotificationsCount: undefined,
    identities: props.identities, // eslint-disable-line solid/reactivity
    oauthLinks: props.oauthLinks, // eslint-disable-line solid/reactivity
    oauthCredentials: props.oauthCredentials, // eslint-disable-line solid/reactivity
    initialized: false
  });

  const setStatusBarColor = async (value) => await window.__TAURI__.core.invoke('plugin:m3|bar_color', { color: value });

  const deviceInsets = async () => {
    const result = await window.__TAURI__.core.invoke('plugin:m3|insets');
    const bodyElement = document.getElementById('charkeeper_app_body');
    bodyElement.style.paddingTop = `${result.adjustedInsetTop}px`;
    bodyElement.style.paddingBottom = `${result.adjustedInsetBottom}px`;
  }

  createEffect(async () => {
    if (appState.accessToken !== undefined) return;

    const stateValue = await readFromCache(CHARKEEPER_ACCESS_TOKEN);
    if (stateValue === null || stateValue === undefined) {
      return setAppState({ ...appState, initialized: true });
    }

    setAppState({ ...appState, accessToken: stateValue, initialized: true });
  });

  createEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;

    const bodyElement = document.getElementById('charkeeper_app_body');
    if (appState.colorSchema === 'dark') {
      // Apply dark theme styles or classes
      bodyElement.classList.add('dark-theme');
      setStatusBarColor('light');
    } else {
      // Apply light theme styles or classes
      bodyElement.classList.remove('dark-theme');
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
        setAppState({ ...appState, ...payload });
      },
      setAccessToken(value) {
        writeToCache(CHARKEEPER_ACCESS_TOKEN, value);
        setAppState({ ...appState, accessToken: value });
      },
      navigate(page, params) {
        setAppState({ ...appState, activePage: page, activePageParams: params });
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
