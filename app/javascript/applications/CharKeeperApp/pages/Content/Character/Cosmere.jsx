import { createSignal, createMemo, Switch, Match, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  CosmereAbilities, CosmereSkills, CosmereDefenses, CosmereHealth, CosmereInfo, CosmereRest, CosmereLeveling, CosmereBonuses,
  CosmereGoals, CosmereSingerForm
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment, Combat, createRoll, Feats } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';
import config from '../../../data/cosmere.json';

const TRANSLATION = {
  en: {
    lightWeapon: 'Light weapons',
    heavyWeapon: 'Heavy weapons',
    armor: 'Armor',
    items: 'Items',
    heroicFilters: {
      agent: 'Agent',
      envoy: 'Envoy',
      hunter: 'Hunter',
      leader: 'Leader',
      scholar: 'Scholar',
      warrior: 'Warrior'
    },
    radiantFilter: 'Radiant Path',
    surgeFilters: {
      abrasion: 'Abrasion',
      adhesion: 'Adhesion',
      cohesion: 'Cohesion',
      division: 'Division',
      gravitation: 'Gravitation',
      illumination: 'Illumination',
      progression: 'Progression',
      tension: 'Tension',
      transformation: 'Transformation',
      transportation: 'Transportation'
    }
  },
  ru: {
    lightWeapon: 'Лёгкое оружие',
    heavyWeapon: 'Тяжёлое оружие',
    armor: 'Доспехи',
    items: 'Предметы',
    heroicFilters: {
      agent: 'Агент',
      envoy: 'Посланник',
      hunter: 'Охотник',
      leader: 'Лидер',
      scholar: 'Учёный',
      warrior: 'Воин'
    },
    radiantFilter: 'Сияющий путь',
    surgeFilters: {
      abrasion: 'Абразия',
      adhesion: 'Адгезия',
      cohesion: 'Когезия',
      division: 'Расщепление',
      gravitation: 'Гравитация',
      illumination: 'Иллюминация',
      progression: 'Прогрессия',
      tension: 'Напряжение',
      transformation: 'Трансформация',
      transportation: 'Транспортация'
    }
  },
  es: {
    lightWeapon: 'Light weapons',
    heavyWeapon: 'Heavy weapons',
    armor: 'Armor',
    items: 'Items',
    heroicFilters: {
      agent: 'Agent',
      envoy: 'Envoy',
      hunter: 'Hunter',
      leader: 'Leader',
      scholar: 'Scholar',
      warrior: 'Warrior'
    },
    radiantFilter: 'Radiant Path',
    surgeFilters: {
      abrasion: 'Abrasion',
      adhesion: 'Adhesion',
      cohesion: 'Cohesion',
      division: 'Division',
      gravitation: 'Gravitation',
      illumination: 'Illumination',
      progression: 'Progression',
      tension: 'Tension',
      transformation: 'Transformation',
      transportation: 'Transportation'
    }
  }
}

export const Cosmere = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openCosmereTest, openD20Attack } = createRoll();
  const [locale] = useAppLocale();

  const lightWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'light_weaponry';
  const heavyWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'heavy_weaponry';
  const armorFilter = (item) => item.kind === 'armor';
  const itemFilter = (item) => item.kind === 'item';

  const heroicFilters = createMemo(() => {
    return Object.keys(config.paths).reduce((acc, element) => {
      acc[element] = (item) => item.origin_value === element;
      return acc;
    }, {});
  });

  const surgeFilters = createMemo(() => {
    return Object.keys(config.surges).reduce((acc, element) => {
      acc[element] = (item) => item.origin_value === element;
      return acc;
    }, {});
  });

  const radiantFilter = (item) => item.origin === 'radiant_path';

  const originValues = createMemo(() => {
    const values = character().features.map((item) => item.origin_value);
    return [...new Set(values)];
  });

  const origins = createMemo(() => {
    const values = character().features.map((item) => item.origin);
    return [...new Set(values)];
  });

  const featFilters = createMemo(() => {
    const result = [];

    Object.keys(config.paths).forEach((item) => {
      if (originValues().includes(item)) result.push({ title: item, translation: localize(TRANSLATION, locale()).heroicFilters[item], callback: heroicFilters()[item] });
    });

    if (origins().includes('radiant_path')) result.push({ title: 'radiant', translation: localize(TRANSLATION, locale()).radiantFilter, callback: radiantFilter });

    Object.keys(config.surges).forEach((item) => {
      if (originValues().includes(item)) result.push({ title: item, translation: localize(TRANSLATION, locale()).surgeFilters[item], callback: surgeFilters()[item] });
    });

    return result;
  });

  const characterTabs = createMemo(() => {
    return ['combat', 'equipment', 'goals', 'rest', 'classLevels', 'bonuses', 'notes', 'avatar'];
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-20 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <CosmereInfo character={character()} />
              <div class="mt-4">
                <CosmereAbilities
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <Show when={character().ancestry === 'singer'}>
                <div class="mt-4">
                  <CosmereSingerForm character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Show>
              <div class="mt-4">
                <CosmereSkills
                  character={character()}
                  openCosmereTest={openCosmereTest}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <CosmereDefenses character={character()} />
              <div class="mt-4">
                <CosmereHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).lightWeapon, callback: lightWeaponFilter },
                  { title: localize(TRANSLATION, locale()).heavyWeapon, callback: heavyWeaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'goals'}>
              <CosmereGoals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <CosmereRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <CosmereLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <CosmereBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    )
  });

  const leftView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CosmereInfo character={character()} />
        <div class="mt-4">
          <CosmereAbilities
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <Show when={character().ancestry === 'singer'}>
          <div class="mt-4">
            <CosmereSingerForm character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </Show>
        <div class="mt-4">
          <CosmereSkills
            character={character()}
            openCosmereTest={openCosmereTest}
            onReplaceCharacter={props.onReplaceCharacter}
          />
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={characterTabs()}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 pb-20 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <CosmereDefenses character={character()} />
              <div class="mt-4">
                <CosmereHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).lightWeapon, callback: lightWeaponFilter },
                  { title: localize(TRANSLATION, locale()).heavyWeapon, callback: heavyWeaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'goals'}>
              <CosmereGoals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <CosmereRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <CosmereLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <CosmereBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    );
  });

  return (
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
      <Roll provider="cosmere" characterId={character().id} />
    </>
  );
}
