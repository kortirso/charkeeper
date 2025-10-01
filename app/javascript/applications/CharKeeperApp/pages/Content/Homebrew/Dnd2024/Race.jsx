import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';

export const Dnd2024Race = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <p>{t('pages.homebrewPage.dnd2024.speed')} - {props.race.data.speed}</p>
      <p>{t('pages.homebrewPage.dnd2024.size')} - {props.race.data.size.map((item) => t(`newCharacterPage.dnd2024.sizes.${item}`)).join(', ')}</p>
    </>
  );
}
