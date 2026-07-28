import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  NimbleAbilities, NimbleSkills, NimbleBonuses, NimbleInfo, NimbleHealth, NimbleLeveling, NimbleRest
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment, Combat, Feats, createRoll } from '../../../components';
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

  const { Roll, openDC20Test, openNimbleAttack } = createRoll();

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

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

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'class', callback: classFilter },
      { title: 'subclass', callback: subclassFilter }
    ];
    return result;
  });

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment', 'classLevels', 'rest'];
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
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <NimbleInfo character={character()} />
              <div class="mt-4">
                <NimbleAbilities
                  character={character()}
                  openD20Test={openDC20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <NimbleSkills
                  character={character()}
                  openD20Test={openDC20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <NimbleHealth character={character()} openD20Test={openDC20Test} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat character={character()} openD20Test={openNimbleAttack} onReplaceCharacter={props.onReplaceCharacter} />
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
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: i18n().meleeStrFilter, callback: meleeStrFilter },
                  { title: i18n().meleeDexFilter, callback: meleeDexFilter },
                  { title: i18n().rangeStrFilter, callback: rangeStrFilter },
                  { title: i18n().rangeDexFilter, callback: rangeDexFilter },
                  { title: i18n().clothFilter, callback: clothFilter },
                  { title: i18n().leatherFilter, callback: leatherFilter },
                  { title: i18n().mailFilter, callback: mailFilter },
                  { title: i18n().plateFilter, callback: plateFilter },
                  { title: i18n().shieldFilter, callback: shieldFilter },
                  { title: i18n().itemsFilter, callback: itemsFilter },
                  { title: i18n().consumablesFilter, callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={i18n().equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <NimbleLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                helpMessage={i18n().levelingHelpMessage}
              />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <NimbleRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
            openD20Test={openDC20Test}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <NimbleSkills
            character={character()}
            openD20Test={openDC20Test}
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
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <NimbleHealth character={character()} openD20Test={openDC20Test} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat character={character()} openD20Test={openNimbleAttack} onReplaceCharacter={props.onReplaceCharacter} />
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
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: i18n().meleeStrFilter, callback: meleeStrFilter },
                  { title: i18n().meleeDexFilter, callback: meleeDexFilter },
                  { title: i18n().rangeStrFilter, callback: rangeStrFilter },
                  { title: i18n().rangeDexFilter, callback: rangeDexFilter },
                  { title: i18n().clothFilter, callback: clothFilter },
                  { title: i18n().leatherFilter, callback: leatherFilter },
                  { title: i18n().mailFilter, callback: mailFilter },
                  { title: i18n().plateFilter, callback: plateFilter },
                  { title: i18n().shieldFilter, callback: shieldFilter },
                  { title: i18n().itemsFilter, callback: itemsFilter },
                  { title: i18n().consumablesFilter, callback: consumablesFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={i18n().equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
              />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <NimbleLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                helpMessage={i18n().levelingHelpMessage}
              />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <NimbleRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
      <Roll provider="nimble" characterId={character().id} />
    </>
  );
}
