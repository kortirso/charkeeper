import { createSignal, createContext, useContext, createResource } from 'solid-js';

const AppI18nContext = createContext();

const fetchDictionary = async (locale) => await import(`../i18n/${locale}.json`);

const readByKeys = (dictionary, key, keys) => {
  if (key === undefined) return dictionary;
  if (dictionary[key] === undefined) return undefined;

  return readByKeys(dictionary[key], keys.shift(), keys);
}

export function AppI18nProvider(props) {
  const [locale, setLocale] = createSignal(props.locale || 'en'); // eslint-disable-line solid/reactivity
  const [dict] = createResource(locale, fetchDictionary);

  const store = [
    locale,
    dict,
    {
      setLocale(value) {
        setLocale(value);
      },
      t(value) {
        if (dict.state !== 'ready') return undefined;

        const keys = value.split('.');
        return readByKeys(dict(), keys.shift(), keys);
      }
    }
  ];

  return (
    <AppI18nContext.Provider value={store}>
      {props.children}
    </AppI18nContext.Provider>
  );
}

export function useAppI18n() { return useContext(AppI18nContext); }
