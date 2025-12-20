import { Show, For, Switch, Match } from 'solid-js';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppLocale } from '../../../context';
import { modifier } from '../../../helpers';

const TRANSLATION = {
  en: {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'attack': 'Attack',
    'proficiency': 'Proficiency bonus',
    'level': 'Level'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'attack': 'Атака',
    'proficiency': 'Бонус мастерства',
    'level': 'Уровень'
  }
}

export const DndBonus = (props) => {
  const [locale] = useAppLocale();

  return (
    <Switch
      fallback={
        <For each={['armor_class', 'initiative', 'speed', 'attack', 'proficiency']}>
          {(slug) =>
            <Show when={props.bonus.value[slug] || props.bonus.dynamic_value[slug]}>
              <p class="bg-gray-200 p-1 rounded text-sm">
                {props.bonus.value[slug] ? modifier(props.bonus.value[slug]) : `+[${TRANSLATION[locale()][props.bonus.dynamic_value[slug]]}]`} {TRANSLATION[locale()][slug]}
              </p>
            </Show>
          }
        </For>
      }
    >
      <Match when={props.bonus.value.abilities}>
        <For each={Object.entries(props.bonus.value.abilities)}>
          {([slug, value]) =>
            <p class="bg-gray-200 p-1 rounded text-sm">
              {modifier(value)} {config.abilities[slug].name[locale()]}
            </p>
          }
        </For>
      </Match>
      <Match when={props.bonus.dynamic_value.abilities}>
        <For each={Object.entries(props.bonus.dynamic_value.abilities)}>
          {([slug, value]) =>
            <p class="bg-gray-200 p-1 rounded text-sm">
              {`+[${TRANSLATION[locale()][value]}]`} {config.abilities[slug].name[locale()]}
            </p>
          }
        </For>
      </Match>
    </Switch>
  );
}
