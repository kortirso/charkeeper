import { Show } from 'solid-js';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    tier: 'Tier',
    trait: 'Trait',
    damageType: 'Damage type',
    burden: 'Burden',
    range: 'Range',
    damage: 'Damage',
    damageBonus: 'Damage bonus',
    kind: 'Kind',
    kinds: {
      'primary weapon': 'Primary',
      'secondary weapon': 'Secondary'
    }
  },
  ru: {
    tier: 'Ранг',
    trait: 'Характеристика',
    damageType: 'Тип урона',
    burden: 'Хват',
    range: 'Дальность',
    damage: 'Урон',
    damageBonus: 'Бонус урона',
    kind: 'Тип оружия',
    kinds: {
      'primary weapon': 'Основное',
      'secondary weapon': 'Запасное'
    }
  },
  es: {
    tier: 'Rango',
    trait: 'Atributo',
    damageType: 'Tipo de daño',
    burden: 'Carga',
    range: 'Alcance',
    damage: 'Daño',
    damageBonus: 'Bonificación de daño',
    kind: 'Tipo de arma',
    kinds: {
      'primary weapon': 'Principal',
      'secondary weapon': 'Secundaria'
    }
  }
}

export const SharedWeapon = (props) => {
  const [locale] = useAppLocale();

  return (
    <div class="flex flex-col gap-1 text-sm">
      <p>{localize(TRANSLATION, locale()).tier} - {props.info.info.tier}</p>
      <p>{localize(TRANSLATION, locale()).kind} - {localize(TRANSLATION, locale()).kinds[props.info.kind]}</p>
      <p>{localize(TRANSLATION, locale()).trait} - {localize(config.traits[props.info.info.trait].name, locale())}</p>
      <p>{localize(TRANSLATION, locale()).damageType} - {localize(config.damageTypes[props.info.info.damage_type].name, locale())}</p>
      <p>{localize(TRANSLATION, locale()).damage} - {props.info.info.damage}</p>
      <p>{localize(TRANSLATION, locale()).damageBonus} - {props.info.info.damage_bonus}</p>
      <p>{localize(TRANSLATION, locale()).range} - {localize(config.ranges[props.info.info.range].name, locale())}</p>
      <p>{localize(TRANSLATION, locale()).burden} - {props.info.info.burden}</p>
      <Show when={props.info.info.features[0] && localize(props.info.info.features[0], locale())}>{localize(props.info.info.features[0], locale())}</Show>
    </div>
  );
}
