import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';

export const DaggerheartRace = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const raceFeats = createMemo(() => {
    if (props.feats === undefined) return [];

    return props.feats.filter((item) => item.origin === 'ancestry' && item.origin_value === props.raceId)
  });

  return (
    <>
      <Show when={raceFeats().length > 0} fallback={<p class="mt-2">{t('pages.homebrewPage.daggerheart.noFeats')}</p>}>
        <For each={raceFeats()}>
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
