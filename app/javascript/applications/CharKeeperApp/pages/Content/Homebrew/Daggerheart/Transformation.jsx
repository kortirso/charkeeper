import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';

export const DaggerheartTransformation = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const transformationFeats = createMemo(() => {
    if (props.feats === undefined) return [];

    return props.feats.filter((item) => item.origin === 'transformation' && item.origin_value === props.transformationId)
  });

  return (
    <>
      <Show when={transformationFeats().length > 0} fallback={<p class="text-sm">{t('pages.homebrewPage.daggerheart.noFeats')}</p>}>
        <For each={transformationFeats()}>
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
