import { createMemo } from 'solid-js';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    lightWeapon: 'Light weapons',
    heavyWeapon: 'Heavy weapons',
    armor: 'Armor',
    items: 'Items',
    fabrials: 'Fabrials'
  },
  ru: {
    lightWeapon: 'Лёгкое оружие',
    heavyWeapon: 'Тяжёлое оружие',
    armor: 'Доспехи',
    items: 'Предметы',
    fabrials: 'Фабриали'
  }
}

export const CosmereEquipment = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const lightWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'light_weaponry';
  const heavyWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'heavy_weaponry';
  const armorCosmereFilter = (item) => item.kind === 'armor';
  const itemCosmereFilter = (item) => item.kind === 'item';
  const fabrialFilter = (item) => item.kind === 'fabrial';

  return (
    <Equipment
      forCampaign={props.forCampaign}
      character={props.character}
      characters={props.characters}
      itemFilters={[
        { title: i18n().lightWeapon, callback: lightWeaponFilter },
        { title: i18n().heavyWeapon, callback: heavyWeaponFilter },
        { title: i18n().armor, callback: armorCosmereFilter },
        { title: i18n().items, callback: itemCosmereFilter },
        { title: i18n().fabrials, callback: fabrialFilter }
      ]}
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
    />
  );
}
