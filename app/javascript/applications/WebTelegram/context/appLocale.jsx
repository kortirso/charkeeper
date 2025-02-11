import { createSignal, createContext, useContext, createResource } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

const AppLocaleContext = createContext();

const fetchDictionary = async (locale) => {
  const dictionary = await import(`../i18n/${locale}.json`);
  return i18n.flatten(dictionary);
}

export function AppLocaleProvider(props) {
  const [locale, setLocale] = createSignal('en');
  const [dict] = createResource(locale, fetchDictionary);

  const store = [
    locale,
    dict,
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
