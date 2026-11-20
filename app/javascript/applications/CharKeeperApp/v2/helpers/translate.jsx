const FALLBACKS = {
  'ru-DHM': 'ru',
  'ru-AG': 'ru'
}

export const localize = (dict, locale) => dict[locale] || dict[FALLBACKS[locale]] || dict.en;
