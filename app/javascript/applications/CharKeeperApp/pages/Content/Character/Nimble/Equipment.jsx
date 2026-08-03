import { createMemo } from 'solid-js';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
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
  }
}

export const NimbleEquipment = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const sortCallback = (a, b) => a.data.price > b.data.price;
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

  return (
    <Equipment
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
      characters={props.characters}
      sortCallback={sortCallback}
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
      currentGuideStep={props.character.guide_step}
      guideStep={props.guideStep}
      helpMessage={props.guideStep ? props.helpMessage : null}
    />
  );
}
