import { createMemo, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';
import { translate } from '../../../../helpers';

const SUBCLASS_MASTERIES = { 1: 'Foundation', 2: 'Specialization', 3: 'Mastery' };

export const DaggerheartSubclass = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const subclassFeats = createMemo(() => {
    if (props.homebrews === undefined) return [];

    return props.homebrews.feats.filter((item) => item.origin === 'subclass' && item.origin_value === props.item.id).sort((a, b) => a.conditions.subclass_mastery - b.conditions.subclass_mastery)
  });

  const daggerheartClasses = createMemo(() => {
    const result = translate(config.classes, locale());
    if (props.homebrews === undefined) return result;

    return { ...result, ...props.homebrews.classes.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  return (
    <>
      <p class="mb-4">{t('pages.homebrewPage.daggerheart.classOrigin')} - {daggerheartClasses()[props.item.class_name]}</p>
      <Show
        when={subclassFeats().length > 0}
        fallback={<p class="mt-2">{t('pages.homebrewPage.daggerheart.noFeats')}</p>}
      >
        <For each={subclassFeats()}>
          {(feat) =>
            <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-500">
              <p class="font-medium!">{feat.title[locale()]}</p>
              <Show when={feat.conditions.subclass_mastery}>
                <p>
                  {t('pages.homebrewPage.daggerheart.subclassMastery')} - {SUBCLASS_MASTERIES[feat.conditions.subclass_mastery]}
                </p>
              </Show>
              <p>{feat.description[locale()]}</p>
            </div>
          }
        </For>
      </Show>
    </>
  );
}
