import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton, TextArea } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close } from '../../assets';
import config from '../../data/daggerheart.json';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { createCharacterBonusRequest } from '../../requests/createCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';

import { modifier } from '../../helpers';

export const Bonuses = (props) => {
  const character = () => props.character;

  const [bonuses, setBonuses] = createSignal(undefined);
  const [createMode, setCreateMode] = createSignal(false);
  const [bonusComment, setBonusComment] = createSignal('');
  const [bonusForm, setBonusForm] = createStore({
    traits: { str: 0, agi: 0, fin: 0, ins: 0, pre: 0, know: 0 },
    health: 0,
    stress: 0,
    evasion: 0,
    armor_score: 0,
    thresholds: { major: 0, severe: 0 },
    attack: 0,
    proficiency: 0
  });

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
    const newObject = removeZeroValues(bonusForm);
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
              <p class="dark:text-snow">{t('daggerheart.terms.traits')}</p>
              <div class="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <For each={Object.entries(config.traits).map(([key, values]) => [key, values.name[locale()]])}>
                  {([slug, trait]) =>
                    <Input
                      numeric
                      labelText={trait}
                      value={bonusForm.traits[slug]}
                      onInput={(value) => setBonusForm({ ...bonusForm, traits: { ...bonusForm.traits, [slug]: Number(value) } })}
                    />
                  }
                </For>
              </div>
              <p class="dark:text-snow">{t('daggerheart.terms.thresholds')}</p>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <For each={['major', 'severe']}>
                  {(slug) =>
                    <Input
                      numeric
                      labelText={t(`daggerheart.health.${slug}`)}
                      value={bonusForm.thresholds[slug]}
                      onInput={(value) => setBonusForm({ ...bonusForm, thresholds: { ...bonusForm.thresholds, [slug]: Number(value) } })}
                    />
                  }
                </For>
              </div>
              <p class="dark:text-snow">{t('daggerheart.bonuses.title')}</p>
              <div class="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <For each={['health', 'stress', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                  {(slug) =>
                    <Input
                      numeric
                      labelText={t(`daggerheart.bonuses.${slug}`)}
                      value={bonusForm[slug]}
                      onInput={(value) => setBonusForm({ ...bonusForm, [slug]: Number(value) })}
                    />
                  }
                </For>
              </div>
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
                </div>
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
