import { Show, For, Switch, Match } from 'solid-js';

import config from '../../../CharKeeperApp/data/daggerheart.json';

import { Button } from '../../components';
import { useAppLocale } from '../../context';
import { Trash } from '../../assets';
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
    'proficiency': 'Proficiency'
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
    'proficiency': 'Мастерство'
  }
}

export const DaggerheartFeat = (props) => {
  const [locale] = useAppLocale();

  return (
    <div class="mb-4">
      <p class="font-medium! mb-1">{props.feature.title.en}</p>
      <p class="text-sm mb-2">{props.feature.description.en}</p>
      <Show when={props.feature.bonuses.length > 0}>
        <div class="flex flex-wrap gap-x-2">
          <For each={props.feature.bonuses}>
            {(bonus) =>
              <Switch
                fallback={
                  <For each={['health', 'stress', 'hope', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                    {(slug) =>
                      <Show when={bonus.value[slug] || bonus.dynamic_value[slug]}>
                        <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                          {bonus.value[slug] ? modifier(bonus.value[slug]) : `+[${TRANSLATION[locale()][bonus.dynamic_value[slug]]}]`} {TRANSLATION[locale()][slug]}
                        </p>
                      </Show>
                    }
                  </For>
                }
              >
                <Match when={bonus.value.traits}>
                  <For each={Object.entries(bonus.value.traits)}>
                    {([slug, value]) =>
                      <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                        {modifier(value)} {config.traits[slug].name[locale()]}
                      </p>
                    }
                  </For>
                </Match>
                <Match when={bonus.dynamic_value.traits}>
                  <For each={Object.entries(bonus.dynamic_value.traits)}>
                    {([slug, value]) =>
                      <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                        {`+[${TRANSLATION[locale()][value]}]`} {config.traits[slug].name[locale()]}
                      </p>
                    }
                  </For>
                </Match>
                <Match when={bonus.value.thresholds}>
                  <For each={['major', 'severe']}>
                    {(slug) =>
                      <Show when={bonus.value.thresholds[slug]}>
                        <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                          {modifier(bonus.value.thresholds[slug])} {TRANSLATION[locale()][slug]}
                        </p>
                      </Show>
                    }
                  </For>
                </Match>
                <Match when={bonus.dynamic_value.thresholds}>
                  <For each={['major', 'severe']}>
                    {(slug) =>
                      <Show when={bonus.dynamic_value.thresholds[slug]}>
                        <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                          {`+[${TRANSLATION[locale()][bonus.dynamic_value.thresholds[slug]]}]`} {TRANSLATION[locale()][slug]}
                        </p>
                      </Show>
                    }
                  </For>
                </Match>
              </Switch>
            }
          </For>
        </div>
      </Show>
      <Button default classList="px-2 py-1" onClick={() => props.onRemoveFeature(props.feature)}>
        <Trash width="20" height="20" />
      </Button>
    </div>
  );
}
