import { Switch, Match, For, Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, SharedBonuses } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { modifier } from '../../../../helpers';

const MAPPING = {
  en: {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'strSave': 'Strength saving throw',
    'dexSave': 'Dexterity saving throw',
    'conSave': 'Constitution saving throw',
    'intSave': 'Intelligence saving throw',
    'wisSave': 'Wisdom saving throw',
    'chaSave': 'Charisma saving throw',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'attack': 'Attack',
    'proficiency_bonus': 'Proficiency bonus'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'strSave': 'Сила спасбросок',
    'dexSave': 'Ловкость спасбросок',
    'conSave': 'Телосложение спасбросок',
    'intSave': 'Интеллект спасбросок',
    'wisSave': 'Мудрость спасбросок',
    'chaSave': 'Харизма спасбросок',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'attack': 'Атака',
    'proficiency_bonus': 'Бонус мастерства'
  }
}
const DYNAMIC_ITEMS = {
  "proficiency_bonus": { "name": { "en": "Proficiency", "ru": "Мастерство" } },
  "level": { "name": { "en": "Level", "ru": "Уровень" } }
};
const TRANSLATION = {
  en: {
    save: 'saving throw'
  },
  ru: {
    save: 'спасбросок'
  }
};
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const SAVES = ['strSave', 'dexSave', 'conSave', 'intSave', 'wisSave', 'chaSave'];
const SAVE_SLUGS = {
  'strSave': 'str',
  'dexSave': 'dex',
  'conSave': 'con',
  'intSave': 'int',
  'wisSave': 'wis',
  'chaSave': 'cha'
};

export const Dnd5Bonuses = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const BonusComponent = (props) => (
    <>
      <For each={Object.entries(props.bonus.value)}>
        {([bonusSlug, value]) =>
          <Switch
            fallback={
              <For each={['armor_class', 'initiative', 'speed', 'attack', 'proficiency_bonus']}>
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
            <Match when={bonusSlug === 'abilities'}>
              <For each={Object.entries(value)}>
                {([slug, value]) =>
                  <p class="bonus">
                    {modifier(value)} {config.abilities[slug].name[locale()]}
                  </p>
                }
              </For>
            </Match>
            <Match when={bonusSlug === 'saves'}>
              <For each={Object.entries(value)}>
                {([slug, value]) =>
                  <p class="bonus">
                    {modifier(value)} {config.abilities[slug].name[locale()]} {TRANSLATION[locale()].save}
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
                <For each={['armor_class', 'initiative', 'speed', 'attack']}>
                  {(slug) =>
                    <Show when={bonusSlug === slug}>
                      <p class="bonus">
                        {`+[${MAPPING[locale()][value] ? MAPPING[locale()][value] : DYNAMIC_ITEMS[value].name[locale()]}]`} {MAPPING[locale()][slug]}
                      </p>
                    </Show>
                  }
                </For>
              }
            >
              <Match when={bonusSlug === 'abilities'}>
                <For each={Object.entries(value)}>
                  {([slug, value]) =>
                    <p class="bonus">
                      {`+[${MAPPING[locale()][value] ? MAPPING[locale()][value] : DYNAMIC_ITEMS[value].name[locale()]}]`} {config.abilities[slug].name[locale()]}
                    </p>
                  }
                </For>
              </Match>
              <Match when={bonusSlug === 'saves'}>
                <For each={Object.entries(value)}>
                  {([slug, value]) =>
                    <p class="bonus">
                      {`+[${MAPPING[locale()][value]}]`} {config.abilities[slug].name[locale()]} {TRANSLATION[locale()].save}
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

      if (ABILITIES.includes(item.modify)) {
        if (acc[key].abilities) {
          const abilities = { ...acc[key].abilities, [item.modify]: value }
          acc[key] = { ...acc[key], abilities: abilities }
        } else {
          acc[key] = { ...acc[key], abilities: { [item.modify]: value } }
        }
      } else if (SAVES.includes(item.modify)) {
        if (acc[key].saves) {
          const saves = { ...acc[key].saves, [SAVE_SLUGS[item.modify]]: value }
          acc[key] = { ...acc[key], saves: saves }
        } else {
          acc[key] = { ...acc[key], saves: { [SAVE_SLUGS[item.modify]]: value } }
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Bonuses' }}>
      <GuideWrapper character={character()}>
        <SharedBonuses
          character={character()}
          bonusComponent={BonusComponent}
          mapping={MAPPING[locale()]}
          dynamicItems={DYNAMIC_ITEMS}
          proficiencyName="proficiency_bonus"
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
