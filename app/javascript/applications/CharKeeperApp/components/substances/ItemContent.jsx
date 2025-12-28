import { createMemo, Show } from 'solid-js';

import { useAppLocale } from '../../context';
import { Hand, TwoHands } from '../../assets';
import daggerheartConfig from '../../data/daggerheart.json';
import { modifier } from '../../helpers';

const TRANSLATION = {
  en: {
    'primary weapon': 'Primary weapon',
    'secondary weapon': 'Secondary weapon',
    'tier': 'Tier',
    'armor': 'Armor',
    'thresholds': 'Damage thresholds',
    'score': 'Armor Score'
  },
  ru: {
    'primary weapon': 'Основное оружие',
    'secondary weapon': 'Запасное оружие',
    'tier': 'Ранг',
    'armor': 'Доспех',
    'thresholds': 'Пороги урона',
    'score': 'Очки доспеха'
  }
};

const DaggerheartWeapon = (props) => {
  const item = () => props.item;

  return (
    <>
      <div class="flex items-center gap-x-2 mt-4">
        <p>{TRANSLATION[props.locale][item().kind]}, {TRANSLATION[props.locale].tier} {[item().info.tier]}</p>
      </div>
      <div class="flex items-center gap-x-2 mt-2">
        <p>{item().info.burden === 1 ? <Hand /> : <TwoHands />}</p>
        <p>{daggerheartConfig.traits[item().info.trait].name[props.locale]},</p>
        <p>{daggerheartConfig.ranges[item().info.range].name[props.locale]}</p>
      </div>
      <div class="flex items-center gap-x-2 mt-2">
        <p>{item().info.damage}{item().info.damage_bonus !== 0 ? modifier(item().info.damage_bonus) : ''}</p>
        <p>{daggerheartConfig.damageTypes[item().info.damage_type].name[props.locale]}</p>
      </div>
      <Show when={item().info.features && item().info.features.length > 0}>
        <p class="mt-2 text-sm">{item().info.features[0][props.locale]}</p>
      </Show>
    </>
  );
}

const DaggerheartArmor = (props) => {
  const item = () => props.item;

  return (
    <>
      <div class="flex items-center gap-x-2 mt-4">
        <p>{TRANSLATION[props.locale].armor}, {TRANSLATION[props.locale].tier} {[item().info.tier]}</p>
      </div>
      <p class="mt-2">{TRANSLATION[props.locale].thresholds} - {item().info.bonuses.thresholds.major} / {item().info.bonuses.thresholds.severe}</p>
      <p class="mt-2">{TRANSLATION[props.locale].score} - {item().info.base_score}</p>
      <Show when={item().info.features && item().info.features.length > 0}>
        <p class="mt-2 text-sm">{item().info.features[0][props.locale]}</p>
      </Show>
    </>
  );
}

const DaggerheartItem = (props) => {
  const item = () => props.item;

  return (
    <>
      <Show when={item().info.features && item().info.features.length > 0}>
        <p class="mt-4 text-sm">{item().info.features[0][props.locale]}</p>
      </Show>
    </>
  );
}

const COMPONENTS = {
  'daggerheart': {
    'primary weapon': DaggerheartWeapon,
    'secondary weapon': DaggerheartWeapon,
    'item': DaggerheartItem,
    'consumables': DaggerheartItem,
    'armor': DaggerheartArmor
  }
}

export const ItemContent = (props) => {
  const item = () => props.item;

  const [locale] = useAppLocale();

  const ItemComponent = createMemo(() => {
    const Component = COMPONENTS[props.provider][item().kind]

    return <Component item={item()} locale={locale()} />;
  });

  return (
    <>
      <p class="text-xl">{item().name}</p>
      <Show when={props.description}>
        <p class="text-sm mt-4">{props.description}</p>
      </Show>
      {ItemComponent()}
    </>
  );
}
