import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

export const AppStateProvider = (props) => {
  const [appState, setAppState] = createStore({
    isAdmin: props.isAdmin || false, // eslint-disable-line solid/reactivity
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    username: props.username, // eslint-disable-line solid/reactivity
    activePage: null,
    activePageParams: {},
    unreadNotificationsCount: undefined
  });

  const store = [
    appState,
    {
      changePayload(payload) {
        setAppState({ ...appState, ...payload });
      },
      setAccessToken(value) {
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
