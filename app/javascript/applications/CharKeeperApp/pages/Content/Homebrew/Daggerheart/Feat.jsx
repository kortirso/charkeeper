import { createMemo, Show, For } from 'solid-js';

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
    if (props.feat.origin === 'community') {
      return props.homebrews.communities.find((item) => item.id === props.feat.origin_value)?.name || '';
    }
    if (props.feat.origin === 'transformation') {
      return props.homebrews.transformations.find((item) => item.id === props.feat.origin_value)?.name || '';
    }
    if (props.feat.origin === 'domain_card') {
      return props.homebrews.domains.find((item) => item.id === props.feat.origin_value)?.name || '';
    }

    return '';
  });

  const featWeapons = createMemo(() => {
    if (props.homebrews === undefined) return [];

    return props.homebrews.items.filter((item) => item.itemable_type === 'Feat' && item.itemable_id === props.feat.id);
  });

  return (
    <>
      <p class="mb-2">{props.feat.description[locale()]}</p>
      <p>{dict().daggerheart.terms.feats.origins[props.feat.origin]} - {featOriginValue()}</p>
      <Show when={featWeapons().length > 0}>
        <div class="mt-2">
          <For each={featWeapons()}>
            {(featWeapon) =>
              <p>{featWeapon.name.en}</p>
            }
          </For>
        </div>
      </Show>
    </>
  );
}
