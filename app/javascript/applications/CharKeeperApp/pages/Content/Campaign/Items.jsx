import { Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Equipment } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

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
    shields: 'Shields'
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
    shields: 'Щиты'
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
    shields: 'Escudos'
  }
}

export const CampaignItems = (props) => {
  const campaign = () => props.campaign;

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

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

  const weaponFilterDc20 = (item) => item.kind.includes('weapon');
  const armorFilterDc20 = (item) => item.kind.includes('armor');
  const shieldFilterDc20 = (item) => item.kind.includes('shield');
  const focusFilterDc20 = (item) => item.kind.includes('focus');

  const itemFilter = (item) => item.kind === 'item';
  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor') || item.kind.includes('shield');
  const ammoFilter = (item) => item.kind === 'ammo';
  const focusFilter = (item) => item.kind === 'focus';
  const toolsFilter = (item) => item.kind === 'tools';
  const musicFilter = (item) => item.kind === 'music';
  const potionFilter = (item) => item.kind === 'potion';

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
  const recipesFilter = (item) => item.kind === 'recipe';
  const upgradesFilter = (item) => item.kind === 'upgrade';

  return (
    <ErrorWrapper payload={{ campaign_id: campaign().id, key: 'CampaignItems' }}>
      <Switch>
        <Match when={campaign().provider === 'dnd5' || campaign().provider === 'dnd2024'}>
          <Equipment
            forCampaign
            withWeight
            withPrice
            character={campaign()}
            characters={props.characters}
            itemFilters={[
              { title: t('equipment.itemsList'), callback: itemFilter },
              { title: t('equipment.weaponsList'), callback: weaponFilter },
              { title: t('equipment.armorList'), callback: armorFilter },
              { title: t('equipment.consumables'), callback: potionFilter},
              { title: t('equipment.ammoList'), callback: ammoFilter },
              { title: t('equipment.focusList'), callback: focusFilter },
              { title: t('equipment.toolsList'), callback: toolsFilter },
              { title: t('equipment.musicList'), callback: musicFilter}
            ]}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'daggerheart'}>
          <Equipment
            forCampaign
            character={campaign()}
            characters={props.characters}
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
              { title: t('equipment.consumables'), callback: consumablesFilter },
              { title: t('equipment.recipes'), callback: recipesFilter },
              { title: t('equipment.upgrades'), callback: upgradesFilter }
            ]}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'dc20'}>
          <Equipment
            forCampaign
            character={campaign()}
            characters={props.characters}
            itemFilters={[
              { title: t('equipment.weaponsList'), callback: weaponFilterDc20 },
              { title: t('equipment.armorList'), callback: armorFilterDc20 },
              { title: t('equipment.shieldList'), callback: shieldFilterDc20 },
              { title: t('equipment.focusList'), callback: focusFilterDc20 }
            ]}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
        <Match when={campaign().provider === 'pathfinder2'}>
          <Equipment
            forCampaign
            withWeight
            withPrice
            character={campaign()}
            characters={props.characters}
            itemFilters={[
              { title: localize(TRANSLATION, locale()).simpleM, callback: simpleMFilter },
              { title: localize(TRANSLATION, locale()).martialM, callback: martialMFilter },
              { title: localize(TRANSLATION, locale()).advancedM, callback: advancedMFilter },
              { title: localize(TRANSLATION, locale()).simpleR, callback: simpleRFilter },
              { title: localize(TRANSLATION, locale()).martialR, callback: martialRFilter },
              { title: localize(TRANSLATION, locale()).unarmored, callback: unarmoredFilter },
              { title: localize(TRANSLATION, locale()).lightArmor, callback: lightFilter },
              { title: localize(TRANSLATION, locale()).mediumArmor, callback: mediumFilter },
              { title: localize(TRANSLATION, locale()).heavyArmor, callback: heavyFilter },
              { title: localize(TRANSLATION, locale()).shields, callback: shieldFilter }
            ]}
            onReloadCharacter={() => console.log('Equipment refresh')}
          />
        </Match>
      </Switch>
    </ErrorWrapper>
  );
}
