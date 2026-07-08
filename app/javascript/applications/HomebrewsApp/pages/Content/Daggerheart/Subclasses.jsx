import { For, Show } from 'solid-js';

import config from '../../../../CharKeeperApp/data/daggerheart.json';
import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSubclassRequest, removeSubclassRequest, copySubclassRequest } from '../../../requests_v2/daggerheart/subclasses';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    className: 'Class name',
    spellcast: 'Spellcast trait',
    mechanics: 'Available mechanics',
    none: 'None',
    foundation: 'Foundation',
    specialization: 'Specialization',
    mastery: 'Mastery',
    other: 'Other'
  },
  ru: {
    className: 'Базовый класс',
    spellcast: 'Заклинательная способность',
    mechanics: 'Доступные механики',
    none: 'Нет',
    foundation: 'Основа',
    specialization: 'Специализация',
    mastery: 'Мастерство',
    other: 'Other'
  },
  es: {
    className: 'Class name',
    spellcast: 'Spellcast trait',
    mechanics: 'Available mechanics',
    none: 'None',
    foundation: 'Foundation',
    specialization: 'Specialization',
    mastery: 'Mastery',
    other: 'Other'
  }
}
const MASTERIES = ['foundation', 'specialization', 'mastery'];

export const DaggerheartSubclasses = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Subclass');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Daggerheart::Homebrews::Subclass', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Subclass', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>{localize(TRANSLATION, locale()).className} - {props.info.class_name}</p>
      <p>{localize(TRANSLATION, locale()).spellcast} - <Show when={props.info.info.spellcast} fallback={localize(TRANSLATION, locale()).none}>{localize(config.traits[props.info.info.spellcast].name, locale())}</Show></p>
      <p>{localize(TRANSLATION, locale()).mechanics} - <Show when={props.info.info.mechanics.length > 0} fallback={localize(TRANSLATION, locale()).none}>{props.info.info.mechanics.map((item) => localize(config.mechanics[item].name, locale())).join(', ')}</Show>
      </p>
      <For each={[1, 2, 3, undefined]}>
        {(level) =>
          <Show when={props.info.features.filter((item) => item.conditions.subclass_mastery === level).length > 0}>
            <div class="pt-4 border-t border-gray-500">
              <p class="mb-4 font-medium!">
                <Show
                  when={level === undefined}
                  fallback={localize(TRANSLATION, locale())[MASTERIES[level - 1]]}
                >
                  {localize(TRANSLATION, locale()).other}
                </Show>
              </p>
              <div class="pl-4 flex flex-col gap-2">
                <For each={props.info.features.filter((item) => item.conditions.subclass_mastery === level)}>
                  {(feature) =>
                    <div class="flex flex-col gap-1">
                      <p class="font-medium!">{feature.title}</p>
                      <p
                        class="feat-markdown"
                        innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                      />
                      <Show when={Object.keys(feature.modifiers).length > 0}>
                        <FeatureModifiers items={feature.modifiers} />
                      </Show>
                      <Show when={feature.items}>
                        <div class="pl-4">
                          <For each={feature.items}>
                            {(item) =>
                              <SharedWeapon info={item} />
                            }
                          </For>
                        </div>
                      </Show>
                    </div>
                  }
                </For>
              </div>
            </div>
          </Show>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Homebrew"
      publicationType="subclass"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSubclassRequest}
      onRemoveRequest={removeSubclassRequest}
      onCopyRequest={copySubclassRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
