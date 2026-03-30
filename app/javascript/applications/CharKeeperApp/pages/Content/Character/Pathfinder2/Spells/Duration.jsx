import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const DIRECT_VALUES = ['instant'];

const TRANSLATION = {
  en: {
    'instant': 'Instant',
    'r': 'round',
    'm': 'minute',
    'h': 'hour',
    'd': 'day',
    duration: 'Duration: '
  },
  ru: {
    'instant': 'Мгновенно',
    'r': 'рн',
    'm': 'мин',
    'h': 'ч',
    'd': 'д',
    duration: 'Длительность: '
  }
};

export const SpellDuration = (props) => {
  const [locale] = useAppLocale();

  const transformValue = () => {
    const values = props.value.split(',');

    return `${values[0]} ${localize(TRANSLATION, locale())[values[1]]}`;
  }

  return (
    <Show when={props.value}>
      <p class="text-sm mt-1">
        <span class="font-medium!">{localize(TRANSLATION, locale()).duration}</span>
        <Show
          when={DIRECT_VALUES.includes(props.value)}
          fallback={transformValue()}
        >
          {localize(TRANSLATION, locale())[props.value]}
        </Show>
      </p>
    </Show>
  );
}
