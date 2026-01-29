import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';

const DIRECT_VALUES = ['A', 'BA', 'R'];

const TRANSLATIONS = {
  en: {
    'ritual': 'R',
    'A': 'A',
    'BA': 'BA',
    'R': 'R',
    'h': 'hr',
    'm': 'min'
  },
  ru: {
    'ritual': 'Р',
    'A': 'Д',
    'BA': 'БД',
    'R': 'Р',
    'h': 'ч',
    'm': 'мин'
  }
};

export const SpellCastTime = (props) => {
  const [locale] = useAppLocale();

  const transformTime = () => {
    const values = props.value.split(',');

    return `${values[0]} ${TRANSLATIONS[locale()][values[1]]}`;
  }

  return (
    <p class="spell-attribute">
      <Show
        when={DIRECT_VALUES.includes(props.value)}
        fallback={transformTime()}
      >
        {TRANSLATIONS[locale()][props.value]}
      </Show>
      <Show when={props.ritual}><span class="ml-2">({TRANSLATIONS[locale()].ritual})</span></Show>
    </p>
  );
}
