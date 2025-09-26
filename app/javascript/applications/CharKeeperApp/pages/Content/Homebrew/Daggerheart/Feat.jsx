import { createMemo } from 'solid-js';

import config from '../../../../data/daggerheart.json';
import { useAppLocale } from '../../../../context';

export const DaggerheartFeat = (props) => {
  const [locale, dict] = useAppLocale();

  const featOriginValue = createMemo(() => {
    if (props.homebrews === undefined) return '';
    if (props.feat.origin === 'ancestry') {
      const defaultRace = config.heritages[props.feat.origin_value];
      return props.homebrews.races.find((item) => item.id === props.feat.origin_value)?.name || (defaultRace ? defaultRace.name[locale()] : '');
    }
    if (props.feat.origin === 'class') {
      const defaultClass = config.classes[props.feat.origin_value];
      return props.homebrews.classes.find((item) => item.id === props.feat.origin_value)?.name || (defaultClass ? defaultClass.name[locale()] : '');
    }
    if (props.feat.origin === 'subclass') {
      return props.homebrews.subclasses.find((item) => item.id === props.feat.origin_value)?.name || '';
    }
    if (props.feat.origin === 'character') {
      if (props.characters === undefined) return '';

      return props.characters.find((item) => item.id === props.feat.origin_value)?.name || '';
    }

    return '';
  });

  return (
    <>
      <p class="mb-2">{props.feat.description[locale()]}</p>
      <p>{dict().daggerheart.terms.feats.origins[props.feat.origin]} - {featOriginValue()}</p>
    </>
  );
}
