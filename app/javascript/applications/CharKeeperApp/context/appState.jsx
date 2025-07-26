import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

const CHARKEEPER_STATE_DATA_KEY = 'CharKeeperStateData';

export const AppStateProvider = (props) => {
  const [appState, setAppState] = createStore({
    colorSchema: props.colorSchema || 'light', // eslint-disable-line solid/reactivity
    isAdmin: props.isAdmin || false, // eslint-disable-line solid/reactivity
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    username: props.username, // eslint-disable-line solid/reactivity
    activePage: null,
    activePageParams: {},
    unreadNotificationsCount: undefined
  });

  createEffect(async () => {
    if (appState.accessToken) return;

    const stateDataString = window.__TAURI_INTERNALS__ ? await readTauriStore() : localStorage.getItem(CHARKEEPER_STATE_DATA_KEY);
    if (stateDataString === null || stateDataString === undefined) return;

    setAppState({ ...appState, ...JSON.parse(stateDataString) });
  });

  const readTauriStore = async () => {
    try {
      const { load } = window.__TAURI__.store;
      const store = await load('settings.json');
      const value = await store.get(CHARKEEPER_STATE_DATA_KEY);
      return value;
    } catch(e) {
      console.log(e.message);
      return null;
    }
  }

  const updateTauriStore = async (payload) => {
    try {
      const { load } = window.__TAURI__.store;
      const store = await load('settings.json');
      await store.set(CHARKEEPER_STATE_DATA_KEY, payload ? JSON.stringify(payload) : null);
      await store.save();
    } catch(e) {
      console.log(e.message);
      return null;
    }
  }

  const store = [
    appState,
    {
      changePayload(payload, updateCache = true) {
        if (updateCache) {
          if (window.__TAURI_INTERNALS__ === undefined) localStorage.setItem(CHARKEEPER_STATE_DATA_KEY, JSON.stringify(payload));
          else updateTauriStore(payload);
        }
        setAppState({ ...appState, ...payload });
      },
      setAccessToken(value) {
        if (value === null) {
          if (window.__TAURI_INTERNALS__ === undefined) localStorage.removeItem(CHARKEEPER_STATE_DATA_KEY);
          else updateTauriStore(null);
        }
        setAppState({ ...appState, accessToken: value });
      },
      changeUsername(value) {
        setAppState({ ...appState, username: value });
      },
      changeColorSchema(value) {
        setAppState({ ...appState, colorSchema: value });
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
