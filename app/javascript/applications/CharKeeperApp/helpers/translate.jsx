const FALLBACKS = {
  'ru-DHM': 'ru'
}

export const translate = (obj, locale, withSorting=false) => {
  let entries = Object.entries(obj).map(([key, values]) =>
    [key, values.name[locale] || values.name[FALLBACKS[locale]] || values.name.en]
  );
  if (!withSorting) return Object.fromEntries(entries);

  return Object.fromEntries(entries.sort((a, b) => a[1].localeCompare(b[1])));
}

export const replace = (initialValue, values) => {
  let resultValue = initialValue;
  Object.entries(values).forEach(([key, value]) => {
    resultValue = resultValue.replaceAll(`{{${key}}}`, value);
  });
  return resultValue;
}

export const localize = (dict, locale) => dict[locale] || dict[FALLBACKS[locale]] || dict.en;
