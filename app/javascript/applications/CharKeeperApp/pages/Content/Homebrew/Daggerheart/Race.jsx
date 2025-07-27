import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';

export const DaggerheartRace = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const raceFeats = createMemo(() => {
    if (props.feats === undefined) return [];

    return props.feats.filter((item) => item.origin === 'ancestry' && item.origin_value === props.race.id)
  });

  return (
    <>
      <Show when={raceFeats().length > 0} fallback={<p>{t('pages.homebrewPage.daggerheart.noFeats')}</p>}>
        <For each={raceFeats()}>
          {(feat) =>
            <div>
              <p class="font-medium! mb-2">{feat.title[locale()]}</p>
              <p>{feat.description[locale()]}</p>
            </div>
          }
        </For>
      </Show>
    </>
  );
}
