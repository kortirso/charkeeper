import { createSignal, createMemo, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  DaggerheartTraits, DaggerheartStatic, DaggerheartHealth, DaggerheartCombat, DaggerheartBeastform, DaggerheartCompanion,
  DaggerheartDomainCards, DaggerheartRest, DaggerheartLeveling, DaggerheartExperience, DaggerheartGold
} from '../../../pages';
import { CharacterNavigation, Equipment, Bonuses, Notes, Avatar, ContentWrapper, Feats } from '../../../components';
import { useAppLocale } from '../../../context';

export const Daggerheart = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('traits');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const primaryWeaponFilterT1 = (item) => item.kind === 'primary weapon' && item.info.tier === 1 && item.info.damage_type === 'physical';
  const primaryWeaponFilterT1Magic = (item) => item.kind === 'primary weapon' && item.info.tier === 1 && item.info.damage_type === 'magic';
  const primaryWeaponFilterT2 = (item) => item.kind === 'primary weapon' && item.info.tier === 2 && item.info.damage_type === 'physical';
  const primaryWeaponFilterT2Magic = (item) => item.kind === 'primary weapon' && item.info.tier === 2 && item.info.damage_type === 'magic';
  const primaryWeaponFilterT3 = (item) => item.kind === 'primary weapon' && item.info.tier === 3 && item.info.damage_type === 'physical';
  const primaryWeaponFilterT3Magic = (item) => item.kind === 'primary weapon' && item.info.tier === 3 && item.info.damage_type === 'magic';
  const primaryWeaponFilterT4 = (item) => item.kind === 'primary weapon' && item.info.tier === 4 && item.info.damage_type === 'physical';
  const primaryWeaponFilterT4Magic = (item) => item.kind === 'primary weapon' && item.info.tier === 4 && item.info.damage_type === 'magic';
  const secondaryWeaponFilterT1 = (item) => item.kind === 'secondary weapon' && item.info.tier === 1;
  const secondaryWeaponFilterT2 = (item) => item.kind === 'secondary weapon' && item.info.tier === 2;
  const secondaryWeaponFilterT3 = (item) => item.kind === 'secondary weapon' && item.info.tier === 3;
  const secondaryWeaponFilterT4 = (item) => item.kind === 'secondary weapon' && item.info.tier === 4;
  const armorFilterT1 = (item) => item.kind === 'armor' && item.info.tier === 1;
  const armorFilterT2 = (item) => item.kind === 'armor' && item.info.tier === 2;
  const armorFilterT3 = (item) => item.kind === 'armor' && item.info.tier === 3;
  const armorFilterT4 = (item) => item.kind === 'armor' && item.info.tier === 4;
  const itemsFilter = (item) => item.kind === 'item';
  const consumablesFilter = (item) => item.kind === 'consumables';

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const communityFilter = (item) => item.origin === 'community';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';
  const beastformFilter = (item) => item.origin === 'beastform';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'community', callback: communityFilter },
      { title: 'class', callback: classFilter },
      { title: 'subclass', callback: subclassFilter }
    ];

    if (character().beastforms.length > 0) result.push({ title: 'beastform', callback: beastformFilter });
    return result;
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['traits', 'combat', 'equipment', 'domainCards', 'companion', 'bonuses', 'rest', 'notes', 'classLevels', 'avatar']}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 flex-1 overflow-y-scroll">
          <Switch>
            <Match when={activeMobileTab() === 'traits'}>
              <DaggerheartTraits character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartExperience object={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Feats character={character()} filters={featFilters()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <DaggerheartStatic character={character()} />
              <div class="mt-4">
                <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <DaggerheartCombat character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: `${t('equipment.primaryWeapon')} T1`, callback: primaryWeaponFilterT1 },
                  { title: `${t('equipment.primaryWeaponMagic')} T1`, callback: primaryWeaponFilterT1Magic },
                  { title: `${t('equipment.primaryWeapon')} T2`, callback: primaryWeaponFilterT2 },
                  { title: `${t('equipment.primaryWeaponMagic')} T2`, callback: primaryWeaponFilterT2Magic },
                  { title: `${t('equipment.primaryWeapon')} T3`, callback: primaryWeaponFilterT3 },
                  { title: `${t('equipment.primaryWeaponMagic')} T3`, callback: primaryWeaponFilterT3Magic },
                  { title: `${t('equipment.primaryWeapon')} T4`, callback: primaryWeaponFilterT4 },
                  { title: `${t('equipment.primaryWeaponMagic')} T4`, callback: primaryWeaponFilterT4Magic },
                  { title: `${t('equipment.secondaryWeapon')} T1`, callback: secondaryWeaponFilterT1 },
                  { title: `${t('equipment.secondaryWeapon')} T2`, callback: secondaryWeaponFilterT2 },
                  { title: `${t('equipment.secondaryWeapon')} T3`, callback: secondaryWeaponFilterT3 },
                  { title: `${t('equipment.secondaryWeapon')} T4`, callback: secondaryWeaponFilterT4 },
                  { title: `${t('equipment.armorList')} T1`, callback: armorFilterT1 },
                  { title: `${t('equipment.armorList')} T2`, callback: armorFilterT2 },
                  { title: `${t('equipment.armorList')} T3`, callback: armorFilterT3 },
                  { title: `${t('equipment.armorList')} T4`, callback: armorFilterT4 },
                  { title: t('equipment.itemsList'), callback: itemsFilter },
                  { title: t('equipment.consumables'), callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <DaggerheartGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'companion'}>
              <DaggerheartCompanion character={character()} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <DaggerheartRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <DaggerheartLeveling character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <DaggerheartTraits character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        <div class="mt-4">
          <DaggerheartStatic character={character()} />
        </div>
        <div class="mt-4">
          <DaggerheartExperience object={character()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
        <div class="mt-4">
          <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
        <div class="mt-4">
          <Feats character={character()} filters={featFilters()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['combat', 'equipment', 'domainCards', 'companion', 'bonuses', 'rest', 'notes', 'classLevels', 'avatar']}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 flex-1 overflow-y-scroll emd:overflow-y-hidden">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartCombat character={character()} />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: `${t('equipment.primaryWeapon')} T1`, callback: primaryWeaponFilterT1 },
                  { title: `${t('equipment.primaryWeaponMagic')} T1`, callback: primaryWeaponFilterT1Magic },
                  { title: `${t('equipment.primaryWeapon')} T2`, callback: primaryWeaponFilterT2 },
                  { title: `${t('equipment.primaryWeaponMagic')} T2`, callback: primaryWeaponFilterT2Magic },
                  { title: `${t('equipment.primaryWeapon')} T3`, callback: primaryWeaponFilterT3 },
                  { title: `${t('equipment.primaryWeaponMagic')} T3`, callback: primaryWeaponFilterT3Magic },
                  { title: `${t('equipment.primaryWeapon')} T4`, callback: primaryWeaponFilterT4 },
                  { title: `${t('equipment.primaryWeaponMagic')} T4`, callback: primaryWeaponFilterT4Magic },
                  { title: `${t('equipment.secondaryWeapon')} T1`, callback: secondaryWeaponFilterT1 },
                  { title: `${t('equipment.secondaryWeapon')} T2`, callback: secondaryWeaponFilterT2 },
                  { title: `${t('equipment.secondaryWeapon')} T3`, callback: secondaryWeaponFilterT3 },
                  { title: `${t('equipment.secondaryWeapon')} T4`, callback: secondaryWeaponFilterT4 },
                  { title: `${t('equipment.armorList')} T1`, callback: armorFilterT1 },
                  { title: `${t('equipment.armorList')} T2`, callback: armorFilterT2 },
                  { title: `${t('equipment.armorList')} T3`, callback: armorFilterT3 },
                  { title: `${t('equipment.armorList')} T4`, callback: armorFilterT4 },
                  { title: t('equipment.itemsList'), callback: itemsFilter },
                  { title: t('equipment.consumables'), callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <DaggerheartGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'companion'}>
              <DaggerheartCompanion character={character()} />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <DaggerheartRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <DaggerheartLeveling character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
    <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
  );
}
