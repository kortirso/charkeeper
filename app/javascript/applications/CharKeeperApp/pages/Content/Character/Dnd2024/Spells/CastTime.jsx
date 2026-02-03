import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const DIRECT_VALUES = ['A', 'BA', 'R'];

const TRANSLATION = {
  en: {
    'A': 'A',
    'BA': 'BA',
    'R': 'R',
    'h': 'hr',
    'm': 'min'
  },
  ru: {
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

    return `${values[0]}${localize(TRANSLATION, locale())[values[1]]}`;
  }

  return (
    <p class="spell-attribute">
      <Show
        when={DIRECT_VALUES.includes(props.value)}
        fallback={transformTime()}
      >
        {localize(TRANSLATION, locale())[props.value]}
      </Show>
    </p>
  );
}
