import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';

const DIRECT_VALUES = ['instant'];

const TRANSLATIONS = {
  en: {
    'concentration': 'C',
    'instant': 'Inst',
    'r': 'rn',
    'm': 'min',
    'h': 'hr',
    'd': 'd'
  },
  ru: {
    'concentration': 'К',
    'instant': 'Мгн',
    'r': 'рн',
    'm': 'мин',
    'h': 'ч',
    'd': 'д'
  }
};

export const SpellDuration = (props) => {
  const [locale] = useAppLocale();

  const transformTime = () => {
    if (!props.value) return;

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
      <Show when={props.concentration}><span class="ml-2">({TRANSLATIONS[locale()].concentration})</span></Show>
    </p>
  );
}
