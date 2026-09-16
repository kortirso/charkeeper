import { createSignal, createMemo, Switch, Match, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  CosmereAbilities, CosmereSkills, CosmereDefenses, CosmereHealth, CosmereInfo, CosmereRest, CosmereLeveling, CosmereBonuses,
  CosmereGoals, CosmereSingerForm, CosmereEquipment, CosmerePowers
} from '../../../pages';
import {
  CharacterNavigation, Notes, Avatar, ContentWrapper, Combat, createRoll, Feats, GoldSingle, ConditionsV2
} from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    radiantFilter: 'Invested Path',
    ancestry: 'Ancestry',
    path: 'Heroic Path',
    surge: 'Invested Power',
    personal: 'Personal'
  },
  ru: {
    radiantFilter: 'Инвестированный путь',
    ancestry: 'Наследие',
    path: 'Путь',
    surge: 'Инвестированная сила',
    personal: 'Личные'
  }
}
const MAPPING = {
  en: {
    'str': 'Strength',
    'spd': 'Speed',
    'int': 'Intellect',
    'wil': 'Willpower',
    'awa': 'Awareness',
    'pre': 'Presence',
    'defense.physical': 'Physical defense',
    'defense.cognitive': 'Cognitive defense',
    'defense.spiritual': 'Spiritual defense',
    'deflect': 'Deflect',
    'health_max': 'Health',
    'focus_max': 'Focus',
    'investiture_max': 'Investiture',
    'movement': 'Movement',
    'attack': 'Attack',
    'melee_attacks': 'Melee attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'melee_damage': 'Melee damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Сила',
    'spd': 'Скорость',
    'int': 'Интеллект',
    'wil': 'Воля',
    'awa': 'Восприятие',
    'pre': 'Харизма',
    'defense.physical': 'Физ защита',
    'defense.cognitive': 'Когнитивная защ',
    'defense.spiritual': 'Духовная защ',
    'deflect': 'Отражение',
    'health_max': 'Здоровье',
    'focus_max': 'Фокус',
    'investiture_max': 'Инвеститура',
    'movement': 'Скорость',
    'attack': 'Атаки',
    'melee_attacks': 'Рукоп атака',
    'range_attacks': 'Дист атаки',
    'damage': 'Урон',
    'melee_damage': 'Рукоп урон',
    'range_damage': 'Дист урон'
  },
  es: {
    'str': 'Strength',
    'spd': 'Speed',
    'int': 'Intellect',
    'wil': 'Willpower',
    'awa': 'Awareness',
    'pre': 'Presence',
    'defense.physical': 'Physical defense',
    'defense.cognitive': 'Cognitive defense',
    'defense.spiritual': 'Spiritual defense',
    'deflect': 'Deflect',
    'health_max': 'Health',
    'focus_max': 'Focus',
    'investiture_max': 'Investiture',
    'movement': 'Movement',
    'attack': 'Attack',
    'melee_attacks': 'Melee attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'melee_damage': 'Melee damage',
    'range_damage': 'Range damage'
  }
}

export const Cosmere = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openCosmereTest, openD20Attack } = createRoll();
  const [locale] = useAppLocale();

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const pathFilter = (item) => item.origin === 'path' || item.origin === 'specialization';
  const radiantFilter = (item) => item.origin === 'radiant_path';
  const surgeFilter = (item) => item.origin === 'surge';
  const personalFilter = (item) => item.origin === 'character';

  const featFilters = createMemo(() => {
    return [
      { title: 'personal', translation: localize(TRANSLATION, locale()).personal, callback: personalFilter },
      { title: 'ancestry', translation: localize(TRANSLATION, locale()).ancestry, callback: ancestryFilter },
      { title: 'path', translation: localize(TRANSLATION, locale()).path, callback: pathFilter },
      { title: 'radiant_path', translation: localize(TRANSLATION, locale()).radiantFilter, callback: radiantFilter },
      { title: 'surge', translation: localize(TRANSLATION, locale()).surge, callback: surgeFilter }
    ];
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
                <ConditionsV2 character={character()} onReloadCharacter={props.onReloadCharacter} />
              </div>
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
                  mapping={MAPPING}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <Show when={character().powers.length > 0}>
                <div class="mt-4">
                  <CosmerePowers character={character()} />
                </div>
              </Show>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  mapping={MAPPING}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <CosmereEquipment
                character={character()}
                upgrades={['weapon', 'armor', 'item']}
                onReloadCharacter={props.onReloadCharacter}
              >
                <GoldSingle character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </CosmereEquipment>
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
              <CosmereBonuses character={character()} mapping={MAPPING} onReloadCharacter={props.onReloadCharacter} />
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
          <ConditionsV2 character={character()} onReloadCharacter={props.onReloadCharacter} />
        </div>
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
                  mapping={MAPPING}
                  openD20Test={openCosmereTest}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <Show when={character().powers.length > 0}>
                <div class="mt-4">
                  <CosmerePowers character={character()} />
                </div>
              </Show>
              <div class="mt-4">
                <Feats
                  directTranslation
                  character={character()}
                  filters={featFilters()}
                  mapping={MAPPING}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <CosmereEquipment
                character={character()}
                upgrades={['weapon', 'armor', 'item']}
                onReloadCharacter={props.onReloadCharacter}
              >
                <GoldSingle character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </CosmereEquipment>
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
              <CosmereBonuses character={character()} mapping={MAPPING} onReloadCharacter={props.onReloadCharacter} />
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
