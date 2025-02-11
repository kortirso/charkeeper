import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

export function AppStateProvider(props) {
  const [appState, setAppState] = createStore({
    accessToken: undefined,
    activePage: 'characters',
    activePageParams: {},
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
