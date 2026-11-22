import { createMemo } from 'solid-js';

import { useAppLocale } from '../../../context';
import { Arrow } from '../../../assets';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    back: 'Back to list'
  },
  ru: {
    back: 'Назад к списку'
  },
  es: {
    back: 'Volver a la lista'
  }
}

export const BackToListButton = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  return (
    <div
      class="back-to-list"
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <Arrow size="20" />
      <p>{i18n().back}</p>
    </div>
  );
}

