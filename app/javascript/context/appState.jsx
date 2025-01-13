import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';

const AppStateContext = createContext();

export function AppStateProvider(props) {
  const [appState, setAppState] = createStore({
    accessToken: undefined,
    activePage: 'Characters'
  });

  const store = [
    appState,
    {
      setAccessToken(value) {
        setAppState({ ...appState, accessToken: value });
      },
      setActivePage(value) {
        setAppState({ ...appState, activePage: value });
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
