const FALLBACKS = {
  'ru-DHM': 'ru'
}

export const translate = (obj, locale) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, values]) => [key, values.name[locale] || values.name[FALLBACKS[locale]]])
  );
}

export const replace = (initialValue, values) => {
  let resultValue = initialValue;
  Object.entries(values).forEach(([key, value]) => {
    resultValue = resultValue.replaceAll(`{{${key}}}`, value);
  });
  return resultValue;
}

export const localize = (dict, locale) => dict[locale] || dict[FALLBACKS[locale]] || dict.en;
