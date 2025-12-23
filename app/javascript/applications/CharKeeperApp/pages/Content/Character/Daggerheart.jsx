import { createSignal, createMemo, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  DaggerheartTraits, DaggerheartStatic, DaggerheartHealth, DaggerheartBeastform, DaggerheartCompanion,
  DaggerheartDomainCards, DaggerheartRest, DaggerheartLeveling, DaggerheartExperience, DaggerheartTransform,
  DaggerheartStances, DaggerheartBonuses
} from '../../../pages';
import {
  CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper, Feats, createDiceRoll, Conditions, Combat, Gold
} from '../../../components';
import { useAppLocale } from '../../../context';

const TRANSLATION = {
  en: {
    helpMessage: "You can choose either a two-handed primary weapon, or a one-handed primary weapon and a one-handed secondary weapon, then equip them. You can choose one set of armor and equip it. You can choose any other items.",
    domainHelpMessage: "To start, look at all the level 1 cards from your class's two domains and choose two cards. You can take one from each domain or two from a single domain.",
    levelingHelpMessage: "In the future on this tab you can level up your character."
  },
  ru: {
    helpMessage: "Вы можете выбрать двуручное оружие или одноручное основное и одноручное дополнительное оружие, а затем экипировать его. Вы можете выбрать набор брони и экипировать его. Вы также можете выбрать другие вещи.",
    domainHelpMessage: "В начале изучите все карты 1 уровня из двух доменов вашего класса и выберите 2 карты. Вы можете выбрать по карте из каждого домена или обе карты из одного домена.",
    levelingHelpMessage: "В будущем на этой вкладке вы сможете указывать уровень вашего персонажа."
  }
}

export const Daggerheart = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('traits');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { DiceRoll, openDiceRoll, openSimpleDiceRoll } = createDiceRoll();
  const [locale, dict] = useAppLocale();

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
  const personalFilter = (item) => item.origin === 'character';
  const transformationFilter = (item) => item.origin === 'transformation';
  const domainCardFilter = (item) => (item.origin === 'domain_card' && item.ready_to_use) || item.origin === 'parent';
  const equipmentFilter = (item) => item.origin === 'equipment';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'community', callback: communityFilter },
      { title: 'class', callback: classFilter },
      { title: 'subclass', callback: subclassFilter },
      { title: 'domainCards', callback: domainCardFilter },
      { title: 'equipment', callback: equipmentFilter }
    ];

    if (character().beastform !== null) result.push({ title: 'beastform', callback: beastformFilter });
    if (character().transformation !== null) result.push({ title: 'transformation', callback: transformationFilter });
    result.push({ title: 'personal', callback: personalFilter });
    return result;
  });

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment', 'domainCards', 'states', 'classLevels', 'rest', 'bonuses'];
    if (character().can_have_companion) result.push('companion');
    return result.concat(['notes', 'avatar']);
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['traits'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'domainCards', '5': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'traits'}>
              <DaggerheartTraits
                character={character()}
                openDiceRoll={openDiceRoll}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
              <div class="mt-4">
                <DaggerheartExperience
                  object={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
              <div class="mt-4">
                <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <DaggerheartStatic character={character()} />
              <div class="mt-4">
                <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  openSimpleDiceRoll={openSimpleDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
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
                currentGuideStep={character().guide_step}
                guideStep={3}
                helpMessage={TRANSLATION[locale()]['helpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('domainCards')}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={4}
                helpMessage={TRANSLATION[locale()]['domainHelpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
                openDiceRoll={openDiceRoll}
              />
            </Match>
            <Match when={activeMobileTab() === 'states'}>
              <DaggerheartTransform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartStances character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'companion'}>
              <DaggerheartCompanion character={character()} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <DaggerheartBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <DaggerheartRest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <DaggerheartLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={5}
                helpMessage={TRANSLATION[locale()]['levelingHelpMessage']}
                finishGuideStep={true}
              />
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
        <DaggerheartTraits
          character={character()}
          openDiceRoll={openDiceRoll}
          onReplaceCharacter={props.onReplaceCharacter}
          onReloadCharacter={props.onReloadCharacter}
        />
        <div class="mt-4">
          <DaggerheartStatic character={character()} />
        </div>
        <div class="mt-4">
          <DaggerheartExperience
            object={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('equipment')}
          />
        </div>
        <div class="mt-4">
          <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        </div>
        <div class="mt-4">
          <Feats
            character={character()}
            filters={featFilters()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
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
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'domainCards', '5': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  openSimpleDiceRoll={openSimpleDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
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
                currentGuideStep={character().guide_step}
                guideStep={3}
                helpMessage={TRANSLATION[locale()]['helpMessage']}
                onNextGuideStepClick={() => setActiveTab('domainCards')}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeTab() === 'domainCards'}>
              <DaggerheartDomainCards
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={4}
                helpMessage={TRANSLATION[locale()]['domainHelpMessage']}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
                openDiceRoll={openDiceRoll}
              />
            </Match>
            <Match when={activeTab() === 'states'}>
              <DaggerheartTransform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <DaggerheartStances character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
            </Match>
            <Match when={activeTab() === 'companion'}>
              <DaggerheartCompanion character={character()} />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <DaggerheartBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <DaggerheartRest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <DaggerheartLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                guideStep={5}
                helpMessage={TRANSLATION[locale()]['levelingHelpMessage']}
                finishGuideStep={true}
              />
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
      <DiceRoll provider="daggerheart" characterId={character().id} advantageDice={character().advantage_dice} />
    </>
  );
}
