import { Switch, Match, For, Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, SharedBonuses } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { modifier } from '../../../../helpers';

const MAPPING = {
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
    'armor_score': 'Слоты доспеха',
    'major': 'Порог ощутимого урона',
    'severe': 'Порог тяжёлого урона',
    'attack': 'Бонус атаки',
    'proficiency': 'Мастерство'
  }
}
const DYNAMIC_ITEMS = {
  "proficiency": { "name": { "en": "Proficiency", "ru": "Мастерство" } },
  "level": { "name": { "en": "Level", "ru": "Уровень" } },
  "tier": { "name": { "en": "Tier", "ru": "Ранг" } }
};
const TRAITS = ['str', 'agi', 'fin', 'ins', 'pre', 'know'];
const THRESHOLDS = ['major', 'severe'];

export const DaggerheartBonuses = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const BonusComponent = (props) => (
    <>
      <For each={Object.entries(props.bonus.value)}>
        {([bonusSlug, value]) =>
          <Switch
            fallback={
              <For each={['health', 'stress', 'hope', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                {(slug) =>
                  <Show when={bonusSlug === slug}>
                    <p class="bonus">
                      {modifier(value)} {MAPPING[locale()][slug]}
                    </p>
                  </Show>
                }
              </For>
            }
          >
            <Match when={bonusSlug === 'traits'}>
              <For each={Object.entries(value)}>
                {([slug, value]) =>
                  <p class="bonus">
                    {modifier(value)} {config.traits[slug].name[locale()]}
                  </p>
                }
              </For>
            </Match>
            <Match when={bonusSlug === 'thresholds'}>
              <For each={Object.entries(value)}>
                {([slug, value]) =>
                  <p class="bonus">
                    {modifier(value)} {MAPPING[locale()][slug]}
                  </p>
                }
              </For>
            </Match>
          </Switch>
        }
      </For>
      <Show when={props.bonus.dynamic_value}>
        <For each={Object.entries(props.bonus.dynamic_value)}>
          {([bonusSlug, value]) =>
            <Switch
              fallback={
                <For each={['health', 'stress', 'hope', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                  {(slug) =>
                    <Show when={bonusSlug === slug}>
                      <p class="bonus">
                        {`+[${MAPPING[locale()][value]}]`} {MAPPING[locale()][slug]}
                      </p>
                    </Show>
                  }
                </For>
              }
            >
              <Match when={bonusSlug === 'traits'}>
                <For each={Object.entries(value)}>
                  {([slug, value]) =>
                    <p class="bonus">
                      {`+[${MAPPING[locale()][value]}]`} {config.traits[slug].name[locale()]}
                    </p>
                  }
                </For>
              </Match>
              <Match when={bonusSlug === 'thresholds'}>
                <For each={Object.entries(value)}>
                  {([slug, value]) =>
                    <p class="bonus">
                      {`+[${MAPPING[locale()][value]}]`} {MAPPING[locale()][slug]}
                    </p>
                  }
                </For>
              </Match>
            </Switch>
          }
        </For>
      </Show>
    </>
  );

  const parseValue = (value) => parseInt(value || 0);

  const saveBonus = async (bonuses, comment) => {
    const payload = bonuses.reduce((acc, item) => {
      const key = item.type === 'static' ? 'value' : 'dynamic_value';
      const value = item.type === 'static' ? parseValue(item.value) : item.value;

      if (TRAITS.includes(item.modify)) {
        if (acc[key].traits) {
          const traits = { ...acc[key].traits, [item.modify]: value }
          acc[key] = { ...acc[key], traits: traits }
        } else {
          acc[key] = { ...acc[key], traits: { [item.modify]: value } }
        }
      } else if (THRESHOLDS.includes(item.modify)) {
        if (acc[key].thresholds) {
          const thresholds = { ...acc[key].thresholds, [item.modify]: value }
          acc[key] = { ...acc[key], thresholds: thresholds }
        } else {
          acc[key] = { ...acc[key], thresholds: { [item.modify]: value } }
        }
      } else {
        acc[key] = { ...acc[key], [item.modify]: value }
      }

      return acc;
    }, { value: {}, dynamic_value: {}, comment: comment });

    return await createCharacterBonusRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { bonus: payload }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBonuses' }}>
      <GuideWrapper character={character()}>
        <SharedBonuses
          character={character()}
          bonusComponent={BonusComponent}
          mapping={MAPPING[locale()]}
          dynamicItems={DYNAMIC_ITEMS}
          proficiencyName="proficiency"
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
