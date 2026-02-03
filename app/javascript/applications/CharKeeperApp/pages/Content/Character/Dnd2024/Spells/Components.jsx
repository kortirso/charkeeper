import { useAppLocale } from '../../../../../context';
import { localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    'v': 'V',
    's': 'S',
    'm': 'M'
  },
  ru: {
    'v': 'В',
    's': 'С',
    'm': 'М',
  }
};

export const SpellComponents = (props) => {
  const [locale] = useAppLocale();

  return (
    <p class="spell-attribute">
      {props.value.split(',').map((item) => localize(TRANSLATION, locale())[item]).join('/')}
    </p>
  );
}
