import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';

export const DaggerheartCommunity = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const communityFeats = createMemo(() => {
    if (props.feats === undefined) return [];

    return props.feats.filter((item) => item.origin === 'community' && item.origin_value === props.communityId)
  });

  return (
    <>
      <Show when={communityFeats().length > 0} fallback={<p class="text-sm">{t('pages.homebrewPage.daggerheart.noFeats')}</p>}>
        <For each={communityFeats()}>
          {(feat) =>
            <div class="mt-2">
              <p class="font-medium!">{feat.title[locale()]}</p>
              <p class="text-sm">{feat.description[locale()]}</p>
            </div>
          }
        </For>
      </Show>
    </>
  );
}
