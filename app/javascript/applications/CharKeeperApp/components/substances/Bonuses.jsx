import { createSignal, createEffect, createMemo, For, Show, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Button, IconButton, TextArea } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close } from '../../assets';
import config from '../../data/daggerheart.json';
import dndConfig from '../../data/dnd2024.json';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { createCharacterBonusRequest } from '../../requests/createCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';
import { modifier } from '../../helpers';

const DAGGERHEART_PLACEHOLDER = "str: 0, agi: 0, fin: 0, ins: 0, pre: 0, know: 0, health: 0, stress: 0, evasion: 0, armor_score: 0, major: 0, severe: 0, attack: 0, proficiency: 0";
const DND_PLACEHOLDER = "str: 0, dex: 0, con: 0, wis: 0, int: 0, cha: 0, armor_class: 0, initiative: 0, speed: 0, health: 0, attack: 0";

export const Bonuses = (props) => {
  const character = () => props.character;

  const [bonuses, setBonuses] = createSignal(undefined);
  const [createMode, setCreateMode] = createSignal(false);
  const [bonusComment, setBonusComment] = createSignal('');
  const [bonusForm, setBonusForm] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    const fetchCharacterBonuses = async () => await fetchCharacterBonusesRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCharacterBonuses()]).then(
      ([characterBonusesData]) => {
        setBonuses(characterBonusesData.bonuses);
      }
    );
  });

  const bonusValuesPlaceholder = createMemo(() => {
    if (character().provider === 'dnd5' || character().provider === 'dnd2024') return DND_PLACEHOLDER;
    if (character().provider === 'daggerheart') return DAGGERHEART_PLACEHOLDER;
  });

  const parseValue = (values, value) => parseInt(values[value] || 0);

  const transformValues = () => {
    const formValues = Object.fromEntries(bonusForm().split(',').map((item) => item.trim().split(':').map((i) => i.trim())));

    if (character().provider === 'daggerheart') {
      return {
        traits: {
          str: parseValue(formValues, 'str'), agi: parseValue(formValues, 'agi'), fin: parseValue(formValues, 'fin'),
          ins: parseValue(formValues, 'ins'), pre: parseValue(formValues, 'pre'), know: parseValue(formValues, 'know')
        },
        health: parseValue(formValues, 'health'),
        stress: parseValue(formValues, 'stress'),
        evasion: parseValue(formValues, 'evasion'),
        armor_score: parseValue(formValues, 'armor_score'),
        thresholds: { major: parseValue(formValues, 'major'), severe: parseValue(formValues, 'severe') },
        attack: parseValue(formValues, 'attack'),
        proficiency: parseValue(formValues, 'proficiency')
      }
    }
    if (character().provider === 'dnd5' || character().provider === 'dnd2024') {
      return {
        abilities: {
          str: parseValue(formValues, 'str'), dex: parseValue(formValues, 'dex'), con: parseValue(formValues, 'con'),
          wis: parseValue(formValues, 'wis'), int: parseValue(formValues, 'int'), cha: parseValue(formValues, 'cha')
        },
        health: parseValue(formValues, 'health'),
        initiative: parseValue(formValues, 'initiative'),
        armor_class: parseValue(formValues, 'armor_class'),
        attack: parseValue(formValues, 'attack'),
        speed: parseValue(formValues, 'speed')
      }
    }
  }

  const removeZeroValues = (form) => {
    return Object.entries(form).reduce((acc, [key, value]) => {
      if (Number.isInteger(value)) {
        if (value !== 0) acc[key] = value;
      } else {
        const newValue = removeZeroValues(value);
        if (Object.keys(newValue).length > 0) acc[key] = newValue;
      }
      return acc;
    }, {});
  }

  const saveBonus = async () => {
    const newObject = removeZeroValues(transformValues());
    if (Object.keys(newObject).length === 0) return;

    const result = await createCharacterBonusRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { bonus: { comment: bonusComment(), value: newObject } }
    );

    if (result.errors === undefined) {
      batch(() => {
        setCreateMode(false);
        setBonusComment('');
        props.onReloadCharacter();
      })
    } else renderAlerts(result.errors);
  }

  const cancelBonus = () => setCreateMode(false);

  const removeBonus = async (event, bonusId) => {
    event.stopPropagation();

    const result = await removeCharacterBonusRequest(appState.accessToken, character().provider, character().id, bonusId);
    if (result.errors === undefined) props.onReloadCharacter();
  }

  return (
    <>
      <Show
        when={!createMode()}
        fallback={
          <div class="p-4 flex-1 flex flex-col blockable">
            <div class="flex-1">
              <TextArea
                classList="mb-2"
                rows="5"
                labelText={t('character.newBonusValues')}
                placeholder={bonusValuesPlaceholder()}
                value={bonusForm()}
                onChange={(value) => setBonusForm(value)}
              />
              <TextArea
                rows="5"
                labelText={t('character.newBonusComment')}
                value={bonusComment()}
                onChange={(value) => setBonusComment(value)}
              />
            </div>
            <div class="flex justify-end mt-4">
              <Button outlined textable size="small" classList="mr-4" onClick={cancelBonus}>{t('cancel')}</Button>
              <Button default textable size="small" onClick={saveBonus}>{t('save')}</Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="mb-2 w-full uppercase" onClick={() => setCreateMode(true)}>
          {t('character.newBonus')}
        </Button>
        <Show when={bonuses() !== undefined}>
          <For each={bonuses()}>
            {(bonus) =>
              <Toggle title={
                <div class="flex items-center">
                  <p class="flex-1">{bonus.comment}</p>
                  <IconButton onClick={(e) => removeBonus(e, bonus.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <Switch>
                  <Match when={character().provider === 'dnd5' || character().provider === 'dnd2024'}>
                    <div class="grid grid-cols-2 lg:grid-cols-3">
                      <Show when={bonus.value.abilities}>
                        <div>
                          <p class="mb-2">{t('dndV2.terms.abilities')}</p>
                          <For each={Object.entries(bonus.value.abilities)}>
                            {([slug, value]) =>
                              <p>{dndConfig.abilities[slug].name[locale()]} - {modifier(value)}</p>
                            }
                          </For>
                        </div>
                      </Show>
                      <Show
                        when={bonus.value.health || bonus.value.initiative || bonus.value.armor_class || bonus.value.attack || bonus.value.speed}
                      >
                        <div>
                          <p class="mb-2">{t('dndV2.bonuses.title')}</p>
                          <For each={['health', 'initiative', 'armor_class', 'attack', 'speed']}>
                            {(slug) =>
                              <Show when={bonus.value[slug]}>
                                <p>{t(`dndV2.bonuses.${slug}`)} - {modifier(bonus.value[slug])}</p>
                              </Show>
                            }
                          </For>
                        </div>
                      </Show>
                    </div>
                  </Match>
                  <Match when={character().provider === 'daggerheart'}>
                    <div class="grid grid-cols-2 lg:grid-cols-3">
                      <Show when={bonus.value.traits}>
                        <div>
                          <p class="mb-2">{t('daggerheart.terms.traits')}</p>
                          <For each={Object.entries(bonus.value.traits)}>
                            {([slug, value]) =>
                              <p class="">{config.traits[slug].name[locale()]} - {modifier(value)}</p>
                            }
                          </For>
                        </div>
                      </Show>
                      <Show when={bonus.value.thresholds}>
                        <div>
                          <p class="mb-2">{t('daggerheart.terms.thresholds')}</p>
                          <For each={['major', 'severe']}>
                            {(slug) =>
                              <Show when={bonus.value.thresholds[slug]}>
                                <p class="">{t(`daggerheart.health.${slug}`)} - {modifier(bonus.value.thresholds[slug])}</p>
                              </Show>
                            }
                          </For>
                        </div>
                      </Show>
                      <Show
                        when={bonus.value.health || bonus.value.stress || bonus.value.evasion || bonus.value.armor_score || bonus.value.attack || bonus.value.proficiency}
                      >
                        <div>
                          <p class="mb-2">{t('daggerheart.bonuses.title')}</p>
                          <For each={['health', 'stress', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                            {(slug) =>
                              <Show when={bonus.value[slug]}>
                                <p class="">{t(`daggerheart.bonuses.${slug}`)} - {modifier(bonus.value[slug])}</p>
                              </Show>
                            }
                          </For>
                        </div>
                      </Show>
                    </div>
                  </Match>
                </Switch>
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
