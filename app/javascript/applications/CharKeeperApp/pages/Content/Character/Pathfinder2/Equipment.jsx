import { createMemo } from 'solid-js';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    simpleM: 'Simple melee weapon',
    martialM: 'Martial melee weapon',
    advancedM: 'Advanced melee weapon',
    simpleR: 'Simple range weapon',
    martialR: 'Martial range weapon',
    unarmored: 'Clothes',
    lightArmor: 'Light armor',
    mediumArmor: 'Medium armor',
    heavyArmor: 'Heavy armor',
    shields: 'Shields',
    items: 'Items',
    consumables: 'Consumables'
  },
  ru: {
    simpleM: 'Простое оружие ближнего боя',
    martialM: 'Особое оружие ближнего боя',
    advancedM: 'Экзотическое оружие ближнего боя',
    simpleR: 'Простое дистанционное оружие ',
    martialR: 'Особое дистанционное оружие',
    unarmored: 'Одежда',
    lightArmor: 'Лёгкая броня',
    mediumArmor: 'Средняя броня',
    heavyArmor: 'Тяжёлая броня',
    shields: 'Щиты',
    items: 'Предметы',
    consumables: 'Расходники'
  },
  es: {
    simpleM: 'Arma cuerpo a cuerpo simple',
    martialM: 'Arma cuerpo a cuerpo marcial',
    advancedM: 'Arma cuerpo a cuerpo avanzada',
    simpleR: 'Arma a distancia simple',
    martialR: 'Arma a distancia marcial',
    unarmored: 'Ropa',
    lightArmor: 'Armadura ligera',
    mediumArmor: 'Armadura media',
    heavyArmor: 'Armadura pesada',
    shields: 'Escudos',
    items: 'Items',
    consumables: 'Consumables'
  }
}

export const Pathfinder2Equipment = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const simpleMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'simple';
  const martialMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'martial';
  const advancedMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'advanced';
  const simpleRFilter = (item) => item.kind === 'weapon' && item.info.type === 'range' && item.info.weapon_skill === 'simple';
  const martialRFilter = (item) => item.kind === 'weapon' && item.info.type === 'range' && item.info.weapon_skill === 'martial';
  const unarmoredFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'unarmored';
  const lightFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'light';
  const mediumFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'medium';
  const heavyFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'heavy';
  const shieldFilter = (item) => item.kind === 'shield';
  const itemFilter = (item) => item.kind === 'item';
  const consumablesFilter = (item) => item.kind === 'consumables';

  return (
    <Equipment
      withWeight={props.withWeight}
      withPrice={props.withPrice}
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
      characters={props.characters}
      itemFilters={[
        { title: i18n().simpleM, callback: simpleMFilter },
        { title: i18n().martialM, callback: martialMFilter },
        { title: i18n().advancedM, callback: advancedMFilter },
        { title: i18n().simpleR, callback: simpleRFilter },
        { title: i18n().martialR, callback: martialRFilter },
        { title: i18n().unarmored, callback: unarmoredFilter },
        { title: i18n().lightArmor, callback: lightFilter },
        { title: i18n().mediumArmor, callback: mediumFilter },
        { title: i18n().heavyArmor, callback: heavyFilter },
        { title: i18n().shields, callback: shieldFilter },
        { title: i18n().items, callback: itemFilter },
        { title: i18n().consumables, callback: consumablesFilter }
      ]}
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
    >
      {props.children}
    </Equipment>
  );
}
