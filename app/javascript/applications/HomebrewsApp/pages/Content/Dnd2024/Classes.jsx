import { createEffect, createSignal, For, Show } from 'solid-js';

import { FeatureModifiers } from './FeatureModifiers';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSpecialityRequest, removeSpecialityRequest } from '../../../requests_v2/dnd2024/specialities';
import { fetchSpellsRequest } from '../../../requests_v2/fetchSpellsRequest';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    level: 'Level',
    staticSpells: 'Static spells',
    hitDie: 'Hit Die',
    saves: 'Saves',
    spellAbility: 'Spell ability'
  },
  ru: {
    level: 'Уровень',
    staticSpells: 'Врождённые заклинания',
    hitDie: 'Кость Хитов',
    saves: 'Спасброски',
    spellAbility: 'Заклинательная характеристика'
  }
}

export const Dnd2024Classes = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const [spells, setSpells] = createSignal(undefined);

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Dnd2024::Homebrews::Speciality');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Dnd2024::Homebrews::Speciality', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Dnd2024::Homebrews::Speciality', ids);
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
      <p>ID - {props.info.id}</p>
      <p>{localize(TRANSLATION, locale()).hitDie} - {props.info.info.hit_dice}</p>
      <p>{localize(TRANSLATION, locale()).saves} - {props.info.info.class_saves.map((item) => config.abilities[item].name[locale()]).join(', ')}</p>
      <Show when={props.info.info.multiclass_spell_level > 0}>
        <p>{localize(TRANSLATION, locale()).spellAbility} - {config.abilities[props.info.info.spell_ability].name[locale()]}</p>
      </Show>
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
      publicationType="class"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSpecialityRequest}
      onRemoveRequest={removeSpecialityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
