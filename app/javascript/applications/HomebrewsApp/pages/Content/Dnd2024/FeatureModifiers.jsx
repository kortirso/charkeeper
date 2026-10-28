import { For } from 'solid-js';

import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'save_dc.str': 'Strength saving throw',
    'save_dc.dex': 'Dexterity saving throw',
    'save_dc.con': 'Constitution saving throw',
    'save_dc.int': 'Intelligence saving throw',
    'save_dc.wis': 'Wisdom saving throw',
    'save_dc.cha': 'Charisma saving throw',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'speeds.swim': 'Swim speed',
    'speeds.flight': 'Flight speed',
    'speeds.climb': 'Climb speed',
    'attack': 'Attack',
    'unarmed_attacks': 'Unarmed attacks',
    'melee_attacks': 'Melee attacks',
    'thrown_attacks': 'Thrown attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'unarmed_damage': 'Unarmed damage',
    'melee_damage': 'Melee damage',
    'thrown_damage': 'Thrown damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'save_dc.str': 'Сила спасбросок',
    'save_dc.dex': 'Ловкость спасбросок',
    'save_dc.con': 'Телосложение спасбросок',
    'save_dc.int': 'Интеллект спасбросок',
    'save_dc.wis': 'Мудрость спасбросок',
    'save_dc.cha': 'Харизма спасбросок',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'speeds.swim': 'Скорость плавания',
    'speeds.flight': 'Скорость полёта',
    'speeds.climb': 'Скорость лазания',
    'attack': 'Атака',
    'unarmed_attacks': 'Безоружные атаки',
    'melee_attacks': 'Рукопашные атаки',
    'thrown_attacks': 'Метательные атаки',
    'range_attacks': 'Дистанционные атаки',
    'damage': 'Урон',
    'unarmed_damage': 'Безоружный урон',
    'melee_damage': 'Рукопашный урон',
    'thrown_damage': 'Метательный урон',
    'range_damage': 'Дистанционный урон'
  },
  es: {
    str: 'Fuerza',
    dex: 'Destreza',
    con: 'Constitución',
    int: 'Inteligencia',
    wis: 'Sabiduría',
    cha: 'Carisma',
    'save_dc.str': 'Tirada de salvación de Fuerza',
    'save_dc.dex': 'Tirada de salvación de Destreza',
    'save_dc.con': 'Tirada de salvación de Constitución',
    'save_dc.int': 'Tirada de salvación de Inteligencia',
    'save_dc.wis': 'Tirada de salvación de Sabiduría',
    'save_dc.cha': 'Tirada de salvación de Carisma',
    armor_class: 'Clase de armadura',
    initiative: 'Iniciativa',
    speed: 'Velocidad',
    'speeds.swim': 'Velocidad nadando',
    'speeds.flight': 'Velocidad volando',
    'speeds.climb': 'Velocidad trepando',
    attack: 'Ataque',
    unarmed_attacks: 'Ataques sin armas',
    melee_attacks: 'Ataques cuerpo a cuerpo',
    thrown_attacks: 'Ataques arrojadizos',
    range_attacks: 'Ataques a distancia',
    damage: 'Daño',
    unarmed_damage: 'Daño sin armas',
    melee_damage: 'Daño cuerpo a cuerpo',
    thrown_damage: 'Daño arrojadizo',
    range_damage: 'Daño a distancia'
  }
}

export const FeatureModifiers = (props) => {
  const [locale] = useAppLocale();

  return (
    <div class="flex gap-1 text-sm">
      <For each={Object.entries(props.items)}>
        {([key, values]) =>
          <p class="bg-gray-200 p-1 rounded">
            {localize(TRANSLATION, locale())[key]} {values.value}
          </p>
        }
      </For>
    </div>
  );
}
