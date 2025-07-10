import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

const CHARKEEPER_STATE_DATA_KEY = 'CharKeeperStateData';

export const AppStateProvider = (props) => {
  const [appState, setAppState] = createStore({
    isAdmin: props.isAdmin || false, // eslint-disable-line solid/reactivity
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    username: props.username, // eslint-disable-line solid/reactivity
    activePage: null,
    activePageParams: {},
    unreadNotificationsCount: undefined
  });

  createEffect(() => {
    if (appState.accessToken) return;

    const stateDataString = localStorage.getItem(CHARKEEPER_STATE_DATA_KEY);
    if (stateDataString === null) return;

    setAppState({ ...appState, ...JSON.parse(stateDataString) });
  });

  const store = [
    appState,
    {
      changePayload(payload) {
        localStorage.setItem(CHARKEEPER_STATE_DATA_KEY, JSON.stringify(payload));
        setAppState({ ...appState, ...payload });
      },
      setAccessToken(value) {
        if (value === null) localStorage.removeItem(CHARKEEPER_STATE_DATA_KEY);
        setAppState({ ...appState, accessToken: value });
      },
      changeUsername(value) {
        setAppState({ ...appState, username: value });
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
