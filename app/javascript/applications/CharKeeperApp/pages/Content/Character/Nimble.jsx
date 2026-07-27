import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  NimbleAbilities, NimbleSkills, NimbleBonuses, NimbleInfo, NimbleHealth
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment, Combat } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    equipmentHelpMessage: 'Here you can select equipment for your character.',
    levelingHelpMessage: 'In the future on this tab you can level up your character.',
    meleeStrFilter: 'Melee STR weapons',
    meleeDexFilter: 'Melee DEX weapons',
    rangeStrFilter: 'Range STR weapons',
    rangeDexFilter: 'Range DEX weapons',
    clothFilter: 'Cloth armor',
    leatherFilter: 'Leather armor',
    mailFilter: 'Mail armor',
    plateFilter: 'Plate armor',
    shieldFilter: 'Shields',
    itemsFilter: 'Items',
    consumablesFilter: 'Consumables'
  },
  ru: {
    equipmentHelpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.',
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.',
    meleeStrFilter: 'Ближнее STR оружие',
    meleeDexFilter: 'Ближнее DEX оружие',
    rangeStrFilter: 'Дистанционное STR оружие',
    rangeDexFilter: 'Дистанционное DEX оружие',
    clothFilter: 'Тканевые доспехи',
    leatherFilter: 'Кожаные доспехи',
    mailFilter: 'Кольчуги',
    plateFilter: 'Латы',
    shieldFilter: 'Щиты',
    itemsFilter: 'Предметы',
    consumablesFilter: 'Зелья'
  },
  es: {
    equipmentHelpMessage: 'Aquí puedes seleccionar el equipo para tu personaje.',
    levelingHelpMessage: 'En el futuro en esta pestaña podrás subir de nivel a tu personaje.',
    meleeStrFilter: 'Melee STR weapons',
    meleeDexFilter: 'Melee DEX weapons',
    rangeStrFilter: 'Range STR weapons',
    rangeDexFilter: 'Range DEX weapons',
    clothFilter: 'Cloth armor',
    leatherFilter: 'Leather armor',
    mailFilter: 'Mail armor',
    plateFilter: 'Plate armor',
    shieldFilter: 'Shields',
    itemsFilter: 'Items',
    consumablesFilter: 'Consumables'
  }
}

export const Nimble = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [locale] = useAppLocale();

  const meleeStrFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'str' && item.info.type === 'melee';
  const meleeDexFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'dex' && item.info.type === 'melee';
  const rangeStrFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'str' && item.info.type === 'range';
  const rangeDexFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'dex' && item.info.type === 'range';
  const clothFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'cloth';
  const leatherFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'leather';
  const mailFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'mail';
  const plateFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'plate';
  const shieldFilter = (item) => item.kind === 'shield';
  const itemsFilter = (item) => item.kind === 'item';
  const consumablesFilter = (item) => item.kind === 'consumables';

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment'];
    return result.concat(['bonuses', 'notes', 'avatar']);
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <NimbleInfo character={character()} />
              <div class="mt-4">
                <NimbleAbilities
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <NimbleSkills
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <NimbleHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).meleeStrFilter, callback: meleeStrFilter },
                  { title: localize(TRANSLATION, locale()).meleeDexFilter, callback: meleeDexFilter },
                  { title: localize(TRANSLATION, locale()).rangeStrFilter, callback: rangeStrFilter },
                  { title: localize(TRANSLATION, locale()).rangeDexFilter, callback: rangeDexFilter },
                  { title: localize(TRANSLATION, locale()).clothFilter, callback: clothFilter },
                  { title: localize(TRANSLATION, locale()).leatherFilter, callback: leatherFilter },
                  { title: localize(TRANSLATION, locale()).mailFilter, callback: mailFilter },
                  { title: localize(TRANSLATION, locale()).plateFilter, callback: plateFilter },
                  { title: localize(TRANSLATION, locale()).shieldFilter, callback: shieldFilter },
                  { title: localize(TRANSLATION, locale()).itemsFilter, callback: itemsFilter },
                  { title: localize(TRANSLATION, locale()).consumablesFilter, callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                finishGuideStep={true}
                helpMessage={localize(TRANSLATION, locale())['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
        <NimbleInfo character={character()} />
        <div class="mt-4">
          <NimbleAbilities
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <NimbleSkills
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('equipment')}
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
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <NimbleHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).meleeStrFilter, callback: meleeStrFilter },
                  { title: localize(TRANSLATION, locale()).meleeDexFilter, callback: meleeDexFilter },
                  { title: localize(TRANSLATION, locale()).rangeStrFilter, callback: rangeStrFilter },
                  { title: localize(TRANSLATION, locale()).rangeDexFilter, callback: rangeDexFilter },
                  { title: localize(TRANSLATION, locale()).clothFilter, callback: clothFilter },
                  { title: localize(TRANSLATION, locale()).leatherFilter, callback: leatherFilter },
                  { title: localize(TRANSLATION, locale()).mailFilter, callback: mailFilter },
                  { title: localize(TRANSLATION, locale()).plateFilter, callback: plateFilter },
                  { title: localize(TRANSLATION, locale()).shieldFilter, callback: shieldFilter },
                  { title: localize(TRANSLATION, locale()).itemsFilter, callback: itemsFilter },
                  { title: localize(TRANSLATION, locale()).consumablesFilter, callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                finishGuideStep={true}
                helpMessage={localize(TRANSLATION, locale())['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
              />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
    </>
  );
}
