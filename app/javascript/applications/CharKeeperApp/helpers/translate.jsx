export const translate = (obj, locale) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, values]) => [key, values.name[locale]])
  );
}
