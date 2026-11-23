const FALLBACKS = {
  'ru-DHM': 'ru',
  'ru-AG': 'ru'
}

export const translate = (obj, locale, withSorting = false) => {
  const entries = Object.entries(obj || {}).map(([key, values]) => [
    key,
    values.name[locale] || values.name[FALLBACKS[locale]] || values.name.en
  ]);

  if (!withSorting) return Object.fromEntries(entries);

  return Object.fromEntries(entries.sort((a, b) => a[1].localeCompare(b[1])));
}

export const localize = (dict, locale) => dict[locale] || dict[FALLBACKS[locale]] || dict.en;
