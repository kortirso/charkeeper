import { createEffect, createSignal, For, Show } from 'solid-js';

import { FeatureModifiers } from './FeatureModifiers';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSubclassRequest, removeSubclassRequest } from '../../../requests_v2/dnd2024/subclasses';
import { fetchSpellsRequest } from '../../../requests_v2/fetchSpellsRequest';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    className: 'Class name',
    level: 'Level',
    staticSpells: 'Static spells'
  },
  ru: {
    className: 'Базовый класс',
    level: 'Уровень',
    staticSpells: 'Врождённые заклинания'
  },
  es: {
    className: 'Class name',
    level: 'Level',
    staticSpells: 'Hechizos estáticos'
  }
}

export const Dnd2024Subclasses = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const [spells, setSpells] = createSignal(undefined);

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Dnd2024::Homebrews::Subclass');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Dnd2024::Homebrews::Subclass', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Dnd2024::Homebrews::Subclass', ids);
  const fetchSpells = async (homebrew) => await fetchSpellsRequest(
    appState.accessToken,
    'dnd2024',
    Object.fromEntries(Object.entries({ homebrew: homebrew, version: '0.4.18' }).filter(([, value]) => value))
  );

  createEffect(() => {
    Promise.all([fetchSpells(), fetchSpells(true)]).then(
      ([spellsData, homebrewSpellsData]) => {
        setSpells(Object.fromEntries(spellsData.spells.concat(homebrewSpellsData.spells).map((item) => [item.slug, item.title])));
      }
    );
  });

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>{localize(TRANSLATION, locale()).className} - {props.info.class_name}</p>
      <For each={props.info.features.sort((a, b) => a.conditions.level > b.conditions.level)}>
        {(feature) =>
          <div class="flex flex-col gap-1">
            <p class="font-medium!">{feature.title} ({localize(TRANSLATION, locale()).level} {feature.conditions.level})</p>
            <p
              class="feat-markdown"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <Show when={spells() && feature.info.static_spells && Object.keys(feature.info.static_spells).length > 0}>
              <p class="mt-1 text-sm"><span class="font-medium!">{localize(TRANSLATION, locale()).staticSpells}:</span> {Object.keys(feature.info.static_spells).map((item) => spells()[item]).join(', ')}</p>
            </Show>
            <Show when={Object.keys(feature.modifiers).length > 0}>
              <FeatureModifiers items={feature.modifiers} />
            </Show>
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="dnd2024"
      parentType="Homebrew"
      publicationType="subclass"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSubclassRequest}
      onRemoveRequest={removeSubclassRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
