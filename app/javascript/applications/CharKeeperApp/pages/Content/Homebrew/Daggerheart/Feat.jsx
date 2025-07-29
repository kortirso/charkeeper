import { createMemo } from 'solid-js';

import { useAppLocale } from '../../../../context';

export const DaggerheartFeat = (props) => {
  const [locale, dict] = useAppLocale();

  const featOriginValue = createMemo(() => {
    if (props.homebrews === undefined) return '';
    if (props.feat.origin === 'ancestry') {
      return props.homebrews.races.find((item) => item.id === props.feat.origin_value)?.name;
    }
    if (props.feat.origin === 'class') {
      return props.homebrews.classes.find((item) => item.id === props.feat.origin_value)?.name;
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
