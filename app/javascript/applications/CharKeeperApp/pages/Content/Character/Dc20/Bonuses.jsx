import { Switch, Match, For, Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, SharedBonuses } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { modifier } from '../../../../helpers';

const MAPPING = {
  en: {
    'mig': 'Might',
    'agi': 'Agility',
    'int': 'Intelligence',
    'cha': 'Charisma',
    'migSave': 'Might save',
    'agiSave': 'Agility save',
    'intSave': 'Intelligence save',
    'chaSave': 'Charisma save',
    'physical_save': 'Physical save',
    'mental_save': 'Mental save',
    'combat_mastery': 'Combat Mastery',
    'initiative': 'Initiative',
    'ad': 'Area Defense',
    'pd': 'Precision Defense',
    'attack': 'Attack',
    'hp': 'Health Points',
    'sp': 'Stamina Points',
    'mp': 'Mana Points',
    'speed': 'Speed'
  },
  ru: {
    'mig': 'Мощь',
    'agi': 'Ловкость',
    'int': 'Интеллект',
    'cha': 'Харизма',
    'migSave': 'Мощь спас',
    'agiSave': 'Ловкость спас',
    'intSave': 'Интеллект спас',
    'chaSave': 'Харизма спас',
    'physical_save': 'Физический спас',
    'mental_save': 'Ментальный спас',
    'combat_mastery': 'Мастерство боя',
    'initiative': 'Инициатива',
    'ad': 'Площадная защита',
    'pd': 'Точечная защита',
    'attack': 'Атака',
    'hp': 'Очки здоровья',
    'sp': 'Очки выносливости',
    'mp': 'Очки маны',
    'speed': 'Скорость'
  }
}
const DYNAMIC_ITEMS = {
  "level": { "name": { "en": "Level", "ru": "Уровень" } }
};
const TRANSLATION = {
  en: {
    save: 'save'
  },
  ru: {
    save: 'спас'
  }
};
const ABILITIES = ['mig', 'agi', 'int', 'cha'];
const SAVES = ['migSave', 'agiSave', 'intSave', 'chaSave'];
const SAVE_SLUGS = {
  'migSave': 'mig',
  'agiSave': 'agi',
  'intSave': 'int',
  'chaSave': 'cha'
};

export const Dc20Bonuses = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const BonusComponent = (props) => (
    <>
      <For each={Object.entries(props.bonus.value)}>
        {([bonusSlug, value]) =>
          <Switch
            fallback={
              <For each={[
                'physical_save', 'mental_save', 'combat_mastery', 'initiative', 'ad', 'pd', 'attack', 'hp', 'sp', 'mp', 'speed'
              ]}>
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
                <For each={[
                  'physical_save', 'mental_save', 'combat_mastery', 'initiative', 'ad', 'pd', 'attack', 'hp', 'sp', 'mp', 'speed'
                ]}>
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
          proficiencyName="combat_mastery"
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
