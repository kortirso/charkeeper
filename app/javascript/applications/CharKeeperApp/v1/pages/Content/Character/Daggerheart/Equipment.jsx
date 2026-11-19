import * as i18n from '@solid-primitives/i18n';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: "You can choose either a two-handed primary weapon, or a one-handed primary weapon and a one-handed secondary weapon, then equip them. You can choose one set of armor and equip it. You can choose any other items."
  },
  ru: {
    helpMessage: "Вы можете выбрать двуручное оружие или одноручное основное и одноручное дополнительное оружие, а затем экипировать его. Вы можете выбрать набор брони и экипировать его. Вы также можете выбрать другие вещи."
  },
  es: {
    helpMessage: "Puedes elegir un arma principal de dos manos, o un arma principal de una mano y un arma secundaria de una mano, luego equiparlos. Puedes elegir un conjunto de armadura y equiparlo. También puedes elegir otros objetos."
  }
}

export const DaggerheartEquipment = (props) => {
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
  const recipesFilter = (item) => item.kind === 'recipe';
  const upgradesFilter = (item) => item.kind === 'upgrade';

  return (
    <Equipment
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
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
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
      currentGuideStep={props.character.guide_step}
      guideStep={props.guideStep}
      helpMessage={props.guideStep ? localize(TRANSLATION, locale()).helpMessage : null}
      onNextGuideStepClick={props.onNextGuideStepClick}
      lootTableComponent={props.lootTableComponent}
    >
      {props.children}
    </Equipment>
  );
}
