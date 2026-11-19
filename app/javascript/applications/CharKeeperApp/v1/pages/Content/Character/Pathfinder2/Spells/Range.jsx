import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const DIRECT_VALUES = ['self', 'touch', 'none'];

const TRANSLATION = {
  en: {
    'self': 'Self',
    'touch': 'Touch',
    'none': '',
    'ft': 'ft',
    'mile': 'mil',
    distance: 'Distance: '
  },
  ru: {
    'self': 'На себя',
    'touch': 'Касание',
    'none': '',
    'ft': 'фт',
    'mile': 'мл',
    distance: 'Дистанция: '
  },
  es: {
    'self': 'A sí mismo',
    'touch': 'Toque',
    'none': '',
    'ft': 'pies',
    'mile': 'milla',
    distance: 'Distancia: '
  }
};

export const SpellRange = (props) => {
  const [locale] = useAppLocale();

  const transformValue = () => {
    const values = props.value.split(',');

    return `${values[0]} ${localize(TRANSLATION, locale())[values[1]]}`;
  }

  return (
    <Show when={props.value}>
      <p class="text-sm mt-1">
        <span class="font-medium!">{localize(TRANSLATION, locale()).distance}</span>
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
