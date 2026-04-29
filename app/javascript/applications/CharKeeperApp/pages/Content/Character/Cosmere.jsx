import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  CosmereAbilities, CosmereSkills, CosmereDefenses, CosmereHealth, CosmereInfo, CosmereRest, CosmereLeveling
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment, Combat, createRoll, Feats } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    weapons: 'Weapons',
    armor: 'Armor',
    items: 'Items',
    agentFilter: 'Agent',
    envoyFilter: 'Envoy',
    hunterFilter: 'Hunter',
    leaderFilter: 'Leader',
    scholarFilter: 'Scholar',
    warriorFilter: 'Warrior'
  },
  ru: {
    weapons: 'Оружие',
    armor: 'Доспехи',
    items: 'Предметы',
    agentFilter: 'Агент',
    envoyFilter: 'Посланник',
    hunterFilter: 'Охотник',
    leaderFilter: 'Лидер',
    scholarFilter: 'Учёный',
    warriorFilter: 'Воин'
  },
  es: {
    weapons: 'Weapons',
    armor: 'Armor',
    items: 'Items',
    agentFilter: 'Agent',
    envoyFilter: 'Envoy',
    hunterFilter: 'Hunter',
    leaderFilter: 'Leader',
    scholarFilter: 'Scholar',
    warriorFilter: 'Warrior'
  }
}

export const Cosmere = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openCosmereTest } = createRoll();
  const [locale] = useAppLocale();

  const weaponFilter = (item) => item.kind === 'weapon';
  const armorFilter = (item) => item.kind === 'armor';
  const itemFilter = (item) => item.kind === 'item';

  const agentFilter = (item) => item.origin_value === 'agent';
  const envoyFilter = (item) => item.origin_value === 'envoy';
  const hunterFilter = (item) => item.origin_value === 'hunter';
  const leaderFilter = (item) => item.origin_value === 'leader';
  const scholarFilter = (item) => item.origin_value === 'scholar';
  const warriorFilter = (item) => item.origin_value === 'warrior';

  const originValues = createMemo(() => {
    const values = character().features.map((item) => item.origin_value);
    return [...new Set(values)];
  });

  const featFilters = createMemo(() => {
    const result = [];

    if (originValues().includes('agent')) result.push({ title: 'agent', translation: localize(TRANSLATION, locale()).agentFilter, callback: agentFilter });
    if (originValues().includes('envoy')) result.push({ title: 'envoy', translation: localize(TRANSLATION, locale()).envoyFilter, callback: envoyFilter });
    if (originValues().includes('hunter')) result.push({ title: 'hunter', translation: localize(TRANSLATION, locale()).hunterFilter, callback: hunterFilter });
    if (originValues().includes('leader')) result.push({ title: 'leader', translation: localize(TRANSLATION, locale()).leaderFilter, callback: leaderFilter });
    if (originValues().includes('scholar')) result.push({ title: 'scholar', translation: localize(TRANSLATION, locale()).scholarFilter, callback: scholarFilter });
    if (originValues().includes('warrior')) result.push({ title: 'warrior', translation: localize(TRANSLATION, locale()).warriorFilter, callback: warriorFilter });

    return result;
  });

  const characterTabs = createMemo(() => {
    return ['combat', 'equipment', 'rest', 'classLevels', 'notes', 'avatar'];
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
                  openD20Attack={openCosmereTest}
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
                  { title: localize(TRANSLATION, locale()).weapons, callback: weaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
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
                  openD20Attack={openCosmereTest}
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
                  { title: localize(TRANSLATION, locale()).weapons, callback: weaponFilter },
                  { title: localize(TRANSLATION, locale()).armor, callback: armorFilter },
                  { title: localize(TRANSLATION, locale()).items, callback: itemFilter }
                ]}
                onReloadCharacter={props.onReloadCharacter}
              />
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
