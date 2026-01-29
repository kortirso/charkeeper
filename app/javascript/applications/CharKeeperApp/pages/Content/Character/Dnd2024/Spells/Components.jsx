import { useAppLocale } from '../../../../../context';

const TRANSLATIONS = {
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
      {props.value.split(',').map((item) => TRANSLATIONS[locale()][item]).join('/')}
    </p>
  );
}
