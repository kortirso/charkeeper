import { Show } from 'solid-js';

import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    ac: 'AC',
    fortitude: 'Fortitude',
    reflex: 'Reflex',
    will: 'Will',
    defense: 'Defense: '
  },
  ru: {
    ac: 'КБ',
    fortitude: 'Стойкость',
    reflex: 'Реакция',
    will: 'Воля',
    defense: 'Защита: '
  }
};

export const SpellDefense = (props) => {
  const [locale] = useAppLocale();

  return (
    <Show when={props.value}>
      <p class="text-sm mt-1">
        <span class="font-medium!">{localize(TRANSLATION, locale()).defense}</span>
        {localize(TRANSLATION, locale())[props.value]}
      </p>
    </Show>
  );
}
