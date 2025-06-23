import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Close } from '../../../../assets';
import { fetchCharacterBonusesRequest } from '../../../../requests/fetchCharacterBonusesRequest';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../../../requests/removeCharacterBonusRequest';

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
    thresholds: { minor: 0, major: 0, severe: 0 },
    attack: 0,
    proficiency: 0
  });

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

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
        setBonuses([result.bonus].concat(bonuses()));
        setCreateMode(false);
        setBonusComment('');
      })
    } else renderAlerts(result.errors);
  }

  const cancelBonus = () => setCreateMode(false);

  const removeBonus = async (event, bonusId) => {
    event.stopPropagation();

    const result = await removeCharacterBonusRequest(appState.accessToken, character().provider, character().id, bonusId);
    if (result.errors === undefined) setBonuses(bonuses().filter((item) => item.id !== bonusId));
  }

  return (
    <>
      <Show
        when={!createMode()}
        fallback={
          <div class="p-4 flex-1 flex flex-col white-box">
            <div class="flex-1">
              <p>{t('character.traits')}</p>
              <div class="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <For each={Object.entries(dict().daggerheart.traits)}>
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
              <p>{t('character.thresholds')}</p>
              <div class="grid grid-cols-3 gap-2 mb-4">
                <For each={['minor', 'major', 'severe']}>
                  {(slug) =>
                    <Input
                      numeric
                      labelText={t(`daggerheart.combat.${slug}`)}
                      value={bonusForm.thresholds[slug]}
                      onInput={(value) => setBonusForm({ ...bonusForm, thresholds: { ...bonusForm.thresholds, [slug]: Number(value) } })}
                    />
                  }
                </For>
              </div>
              <p>{t('character.bonuses')}</p>
              <div class="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                <For each={['health', 'stress', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                  {(slug) =>
                    <Input
                      numeric
                      labelText={t(`daggerheart.combat.${slug}`)}
                      value={bonusForm[slug]}
                      onInput={(value) => setBonusForm({ ...bonusForm, [slug]: Number(value) })}
                    />
                  }
                </For>
              </div>
              <label class="text-sm/4 font-cascadia-light text-gray-400">{t('character.newBonusComment')}</label>
              <textarea
                rows="5"
                class="w-full border border-gray-200 rounded p-1 text-sm"
                onInput={(e) => setBonusComment(e.target.value)}
                value={bonusComment()}
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
              <Toggle disabled title={
                <div class="flex items-center">
                  <p class="flex-1">{bonus.comment}</p>
                  <IconButton onClick={(e) => removeBonus(e, bonus.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <p />
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
