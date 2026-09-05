import { createSignal, createMemo, Show } from 'solid-js';

import { Equipment, Checkbox } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    lightWeapon: 'Light weapons',
    heavyWeapon: 'Heavy weapons',
    armor: 'Armor',
    items: 'Items',
    fabrials: 'Fabrials',
    limits: 'Limit choises by setting'
  },
  ru: {
    lightWeapon: 'Лёгкое оружие',
    heavyWeapon: 'Тяжёлое оружие',
    armor: 'Доспехи',
    items: 'Предметы',
    fabrials: 'Фабриали',
    limits: 'Ограничить выбор рамками сеттинга'
  }
}

export const CosmereEquipment = (props) => {
  const [limit, setLimit] = createSignal(props.forCampaign ? false : true);

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const lightWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'light_weaponry' && (!limit() || !item.info.only || item.info.only.includes(props.character.setting));
  const heavyWeaponFilter = (item) => item.kind === 'weapon' && item.info.weapon_skill === 'heavy_weaponry' && (!limit() || !item.info.only || item.info.only.includes(props.character.setting));
  const armorCosmereFilter = (item) => item.kind === 'armor' && (!limit() || !item.info.only || item.info.only.includes(props.character.setting));
  const itemCosmereFilter = (item) => item.kind === 'item' && (!limit() || !item.info.only || item.info.only.includes(props.character.setting));
  const fabrialFilter = (item) => item.kind === 'fabrial' && (!props.character.setting || props.character.setting === 'roshar');

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
      selectComponent={
        <Show when={!props.forCampaign}>
          <Checkbox
            classList="mb-2"
            labelText={i18n().limits}
            labelPosition="right"
            labelClassList="ml-2"
            checked={limit()}
            onToggle={() => setLimit(!limit())}
          />
        </Show>
      }
    />
  );
}
