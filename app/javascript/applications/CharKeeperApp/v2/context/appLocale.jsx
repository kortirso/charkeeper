import { createSignal, createContext, useContext } from 'solid-js';

const AppLocaleContext = createContext();

export function LocaleProvider(props) {
  const [locale, setLocale] = createSignal(props.locale || 'en'); // eslint-disable-line solid/reactivity

  const store = [
    locale,
    {
      setLocale(value) {
        setLocale(value);
      }
    }
  ];

  return (
    <AppLocaleContext.Provider value={store}>
      {props.children}
    </AppLocaleContext.Provider>
  );
}

export function useAppLocale() { return useContext(AppLocaleContext); }
