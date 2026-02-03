import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const DIRECT_VALUES = ['instant'];

const TRANSLATION = {
  en: {
    'instant': 'Inst',
    'r': 'rn',
    'm': 'min',
    'h': 'hr',
    'd': 'd'
  },
  ru: {
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
