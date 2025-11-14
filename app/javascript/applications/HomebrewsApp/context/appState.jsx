import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

export const AppStateProvider = (props) => {
  const [appState, setAppState] = createStore({
    accessToken: props.accessToken, // eslint-disable-line solid/reactivity
    activePage: null,
    activePageParams: {},
    initialized: false
  });

  const store = [
    appState,
    {
      setAccessToken(value) {
        setAppState({ ...appState, accessToken: value });
      },
      navigate(page, params) {
        setAppState({ ...appState, activePage: page, activePageParams: params });
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
