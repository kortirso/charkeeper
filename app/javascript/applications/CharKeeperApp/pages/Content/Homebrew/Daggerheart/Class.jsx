import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';

export const DaggerheartClass = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <p class="mb-2">{t('pages.homebrewPage.daggerheart.evasion')} - {props.item.evasion}</p>
      <p class="mb-2">{t('pages.homebrewPage.daggerheart.maxHealth')} - {props.item.health_max}</p>
      <p>{t('pages.homebrewPage.daggerheart.domains')} - {Object.entries(config.domains).filter(([key,]) => props.item.domains.includes(key)).map(([, values]) => values.name[locale()]).join(', ')}</p>
    </>
  );
}
