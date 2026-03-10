import { createMemo, Show } from 'solid-js';

import { useAppState, useAppLocale } from '../../context';
import { Hand, TwoHands } from '../../assets';
import daggerheartConfig from '../../data/daggerheart.json';
import { modifier, localize } from '../../helpers';

const TRANSLATION = {
  en: {
    'primary weapon': 'Primary weapon',
    'secondary weapon': 'Secondary weapon',
    'tier': 'Tier',
    'armor': 'Armor',
    'thresholds': 'Damage thresholds',
    'score': 'Armor Score',
    'dnd': {
      type: {
        light: 'Light',
        martial: 'Martial'
      },
      armorType: {
        light: 'Light Armor',
        medium: 'Medium Armor',
        heavy: 'Heavy Armor'
      },
      melee: 'Melee weapon',
      thrown: 'Melee/Thrown weapon',
      range: 'Range weapon',
      weight: 'Weight',
      price: 'Price',
      gold: 'gold',
      silver: 'silver',
      copper: 'copper',
      bludge: 'Bludgeoning',
      pierce: 'Piercing',
      slash: 'Slasing',
      damage: 'Damage',
      reach: 'Reach',
      heavy: 'Heavy',
      '2handed': 'Two-Handed',
      finesse: 'Finess',
      light: 'Light',
      versatile: 'Versatile',
      reload: 'Reload',
      caption: 'Captions',
      ac: 'Armor Class',
      maxDex: 'Maximum Dex',
      strReq: 'Strength requirements',
      stealth: 'Stealth',
      disadv: 'Disadvantage'
    }
  },
  ru: {
    'primary weapon': 'Основное оружие',
    'secondary weapon': 'Запасное оружие',
    'tier': 'Ранг',
    'armor': 'Доспех',
    'thresholds': 'Пороги урона',
    'score': 'Очки доспеха',
    'dnd': {
      type: {
        light: 'Простое',
        martial: 'Воинское'
      },
      armorType: {
        light: 'Лёгкий доспех',
        medium: 'Средний доспех',
        heavy: 'Тяжёлый доспех'
      },
      melee: 'Рукопашное оружие',
      thrown: 'Рукопашное/метательное оружие',
      range: 'Дистанционное оружие',
      weight: 'Вес',
      price: 'Цена',
      gold: 'зм',
      silver: 'см',
      copper: 'мм',
      bludge: 'дробящий',
      pierce: 'колющий',
      slash: 'режущий',
      damage: 'Урон',
      reach: 'Досягаемость',
      heavy: 'Тяжёлое',
      '2handed': 'Двуручное',
      finesse: 'Фехтовальное',
      light: 'Лёгкое',
      versatile: 'Универсальное',
      reload: 'Перезарядка',
      caption: 'Свойства',
      ac: 'Класс доспеха',
      maxDex: 'Максимальная ловкость',
      strReq: 'Требования силы',
      stealth: 'Скрытность',
      disadv: 'помеха'
    }
  }
};

const DaggerheartWeapon = (props) => {
  const item = () => props.item;

  return (
    <>
      <div class="mt-4">
        <p>{TRANSLATION[props.locale][item().kind]}, {TRANSLATION[props.locale].tier} {[item().info.tier]}</p>
      </div>
      <div class="flex items-center gap-x-2 mt-2">
        <p>{item().info.burden === 1 ? <Hand /> : <TwoHands />}</p>
        <p>{localize(daggerheartConfig.traits[item().info.trait].name, props.currentLocale)},</p>
        <Show when={item().info.range}>
          <p>{localize(daggerheartConfig.ranges[item().info.range].name, props.currentLocale)}</p>
        </Show>
      </div>
      <div class="flex items-center gap-x-2 mt-2">
        <p>{item().info.damage}{item().info.damage_bonus !== 0 ? modifier(item().info.damage_bonus) : ''}</p>
        <p>{localize(daggerheartConfig.damageTypes[item().info.damage_type].name, props.currentLocale)}</p>
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

const renderDndPrice = (value, locale) => {
  if (value >= 100) return `${value / 100} ${localize(TRANSLATION, locale).dnd.gold}`;
  if (value >= 10) return `${value / 10} ${localize(TRANSLATION, locale).dnd.silver}`;
  return `${value} ${localize(TRANSLATION, locale).dnd.copper}`;
}

const DndWeapon = (props) => {
  const item = () => props.item;

  return (
    <>
      <p class="mt-4">{localize(TRANSLATION, props.locale).dnd.type[item().info.weapon_skill]}, {localize(TRANSLATION, props.locale).dnd[item().info.type]}</p>
      <p class="text-sm mt-2">{localize(TRANSLATION, props.locale).dnd.weight}: {item().data.weight}</p>
      <p class="text-sm mt-1">{localize(TRANSLATION, props.locale).dnd.price}: {renderDndPrice(item().data.price, props.locale)}</p>
      <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.damage}: {item().info.damage} {localize(TRANSLATION, props.locale).dnd[item().info.damage_type]}</p>
      <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.caption}: {Object.keys(item().info.caption).map((element) => localize(TRANSLATION, props.locale).dnd[element]).join(', ')}</p>
    </>
  );
}

const DndArmor = (props) => {
  const item = () => props.item;

  return (
    <>
      <p class="mt-4">{localize(TRANSLATION, props.locale).dnd.armorType[item().info.armor_skill]}</p>
      <p class="text-sm mt-2">{localize(TRANSLATION, props.locale).dnd.weight}: {item().data.weight}</p>
      <p class="text-sm mt-1">{localize(TRANSLATION, props.locale).dnd.price}: {renderDndPrice(item().data.price, props.locale)}</p>
      <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.ac}: {item().info.ac}</p>
      <Show when={item().info.max_dex}>
        <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.maxDex}: {modifier(item().info.max_dex)}</p>
      </Show>
      <Show when={item().info.str_req}>
        <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.strReq}: {item().info.str_req}</p>
      </Show>
      <p class="mt-2">{localize(TRANSLATION, props.locale).dnd.stealth}: {item().info.stealth ? '-' : localize(TRANSLATION, props.locale).dnd.disadv}</p>
    </>
  );
}

const DndItem = (props) => {
  const item = () => props.item;

  return (
    <>
      <p class="text-sm mt-2">{localize(TRANSLATION, props.locale).dnd.weight}: {item().data.weight}</p>
      <p class="text-sm mt-1">{localize(TRANSLATION, props.locale).dnd.price}: {renderDndPrice(item().data.price, props.locale)}</p>
    </>
  );
}

const COMPONENTS = {
  'daggerheart': {
    'primary weapon': DaggerheartWeapon,
    'secondary weapon': DaggerheartWeapon,
    'item': DaggerheartItem,
    'recipe': DaggerheartItem,
    'consumables': DaggerheartItem,
    'armor': DaggerheartArmor,
    'upgrade': DaggerheartItem
  },
  'dnd5': {
    'weapon': DndWeapon,
    'armor': DndArmor,
    'shield': DndItem,
    'item': DndItem,
    'ammo': DndItem,
    'focus': DndItem,
    'tools': DndItem,
    'music': DndItem,
    'potion': DndItem
  },
  'dnd2024': {
    'weapon': DndWeapon,
    'armor': DndArmor,
    'shield': DndItem,
    'item': DndItem,
    'ammo': DndItem,
    'focus': DndItem,
    'tools': DndItem,
    'music': DndItem,
    'potion': DndItem
  }
}

export const ItemContent = (props) => {
  const item = () => props.item;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales['daggerheart'];
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;
    return locale();
  });

  const ItemComponent = createMemo(() => {
    const Component = COMPONENTS[props.provider][item().kind]

    return <Component item={item()} locale={locale()} currentLocale={currentLocale()} />;
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
