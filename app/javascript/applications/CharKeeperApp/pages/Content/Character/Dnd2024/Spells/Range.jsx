import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';

const DIRECT_VALUES = ['self', 'touch', 'none'];

const TRANSLATION = {
  en: {
    'self': 'Self',
    'touch': 'Touch',
    'none': '',
    'ft': 'ft',
    'mile': 'mil'
  },
  ru: {
    'self': 'На себя',
    'touch': 'Кас',
    'none': '',
    'ft': 'фт',
    'mile': 'мл'
  }
};

export const SpellRange = (props) => {
  const [locale] = useAppLocale();

  const transformTime = () => {
    const values = props.value.split(',');

    return `${values[0]}${TRANSLATION[locale()][values[1]]}`;
  }

  return (
    <p class="spell-attribute">
      <Show
        when={DIRECT_VALUES.includes(props.value)}
        fallback={transformTime()}
      >
        {TRANSLATION[locale()][props.value]}
      </Show>
    </p>
  );
}
