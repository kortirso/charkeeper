import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';

export const DaggerheartClass = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const classFeats = createMemo(() => {
    if (props.feats === undefined) return [];

    return props.feats.filter((item) => item.origin === 'class' && item.origin_value === props.item.id)
  });

  return (
    <>
      <p class="mb-2">{t('pages.homebrewPage.daggerheart.evasion')} - {props.item.evasion}</p>
      <p class="mb-2">{t('pages.homebrewPage.daggerheart.maxHealth')} - {props.item.health_max}</p>
      <p>{t('pages.homebrewPage.daggerheart.domains')} - {Object.entries(config.domains).filter(([key,]) => props.item.domains.includes(key)).map(([, values]) => values.name[locale()]).join(', ')}</p>
      <Show when={classFeats().length > 0} fallback={<p class="mt-2">{t('pages.homebrewPage.daggerheart.noClassFeats')}</p>}>
        <For each={classFeats()}>
          {(feat) =>
            <div class="mt-2">
              <p class="font-medium!">{feat.title[locale()]}</p>
              <p>{feat.description[locale()]}</p>
            </div>
          }
        </For>
      </Show>
    </>
  );
}
