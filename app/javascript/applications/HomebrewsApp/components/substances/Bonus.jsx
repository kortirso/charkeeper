import { Show, For, Switch, Match } from 'solid-js';

import config from '../../../CharKeeperApp/data/daggerheart.json';

import { useAppLocale } from '../../context';
import { modifier } from '../../helpers';

const TRANSLATION = {
  en: {
    'str': 'Strength',
    'agi': 'Agility',
    'fin': 'Finesse',
    'ins': 'Instinct',
    'pre': 'Presence',
    'know': 'Knowledge',
    'health': 'Health',
    'stress': 'Stress',
    'hope': 'Hope',
    'evasion': 'Evasion',
    'armor_score': 'Armor score',
    'major': 'Major threshold',
    'severe': 'Severe threshold',
    'attack': 'Attacks',
    'proficiency': 'Proficiency',
    'level': 'Level',
    'tier': 'Tier'
  },
  ru: {
    'str': 'Сила',
    'agi': 'Проворность',
    'fin': 'Искусность',
    'ins': 'Инстинкт',
    'pre': 'Влияние',
    'know': 'Знание',
    'health': 'Здоровье',
    'stress': 'Стресс',
    'hope': 'Надежда',
    'evasion': 'Уклонение',
    'armor_score': 'Слоты Доспеха',
    'major': 'Ощутимый урон',
    'severe': 'Тяжёлый урон',
    'attack': 'Атаки',
    'proficiency': 'Мастерство',
    'level': 'Уровень',
    'tier': 'Ранг'
  }
}

export const Bonus = (props) => {
  const [locale] = useAppLocale();

  return (
    <Switch
      fallback={
        <For each={['health', 'stress', 'hope', 'evasion', 'armor_score', 'attack', 'proficiency']}>
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
      <Match when={props.bonus.value.traits}>
        <For each={Object.entries(props.bonus.value.traits)}>
          {([slug, value]) =>
            <p class="bg-gray-200 p-1 rounded text-sm">
              {modifier(value)} {config.traits[slug].name[locale()]}
            </p>
          }
        </For>
      </Match>
      <Match when={props.bonus.dynamic_value.traits}>
        <For each={Object.entries(props.bonus.dynamic_value.traits)}>
          {([slug, value]) =>
            <p class="bg-gray-200 p-1 rounded text-sm">
              {`+[${TRANSLATION[locale()][value]}]`} {config.traits[slug].name[locale()]}
            </p>
          }
        </For>
      </Match>
      <Match when={props.bonus.value.thresholds}>
        <For each={['major', 'severe']}>
          {(slug) =>
            <Show when={props.bonus.value.thresholds[slug]}>
              <p class="bg-gray-200 p-1 rounded text-sm">
                {modifier(props.bonus.value.thresholds[slug])} {TRANSLATION[locale()][slug]}
              </p>
            </Show>
          }
        </For>
      </Match>
      <Match when={props.bonus.dynamic_value.thresholds}>
        <For each={['major', 'severe']}>
          {(slug) =>
            <Show when={props.bonus.dynamic_value.thresholds[slug]}>
              <p class="bg-gray-200 p-1 rounded text-sm">
                {`+[${TRANSLATION[locale()][props.bonus.dynamic_value.thresholds[slug]]}]`} {TRANSLATION[locale()][slug]}
              </p>
            </Show>
          }
        </For>
      </Match>
    </Switch>
  );
}
