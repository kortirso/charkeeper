import { createEffect, createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, Dice } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus, Upgrade } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    base: 'Base',
    race: 'Ancestry',
    background: 'Background',
    free: 'Free',
    abilityBoosts: 'You can improve your abilities:'
  },
  ru: {
    base: 'Базовое',
    race: 'Народ',
    background: 'Происхождение',
    free: 'Универсальное',
    abilityBoosts: 'Вы можете улучшить следующие характеристики:'
  },
  es: {
    base: 'Base',
    race: 'Ancestría',
    background: 'Trasfondo',
    free: 'Libre',
    abilityBoosts: 'Puedes mejorar las siguientes características:'
  }
}

export const Pathfinder2Abilities = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().raw_abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setAbilitiesData(character().raw_abilities);
      setEditMode(character().guide_step === 1);
      setLastActiveCharacterId(character().id);
    });
  });

  const bonusValue = (value) => Math.floor((value / 2) - 5);
  const boosted = (value) => value % 2 === 1;

  const decreaseAbilityValue = (slug) => {
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - (abilitiesData()[slug] > 18 ? 1 : 2) });
  }

  const increaseAbilityValue = (slug) => {
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + (abilitiesData()[slug] >= 18 ? 1 : 2) });
  }

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().raw_abilities);
      setEditMode(false);
    });
  }

  const renderAbilityBoost = (abilityBoosts, source) => {
    if (!abilityBoosts) return '';

    const result = [];
    Object.keys(abilityBoosts).forEach((key) => {
      if (key === 'free') return;

      result.push(`${key.split('_').map((item) => localize(config.abilities[item].name, locale())).join('/')} - ${abilityBoosts[key]}`)
    });
    if (abilityBoosts.free) result.push(`${localize(TRANSLATION, locale()).free} - ${abilityBoosts.free}`);

    return (
      <p class="text-sm">
        <span class="font-medium!">{localize(TRANSLATION, locale())[source]} </span>
        <span>{result.join('; ')}</span>
      </p>
    );
  }

  const updateCharacter = async () => {
    const payload = { abilities: abilitiesData() }
    const result = await updateCharacterRequest(appState.accessToken, 'pathfinder2', character().id, { character: payload });

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Abilities' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <Show when={character().ability_boosts_v2}>
          <div class="warning">
            <p class="text-sm">{localize(TRANSLATION, locale()).abilityBoosts}</p>
            <For each={['background', 'race', 'base']}>
              {(item) =>
                <Show when={character().ability_boosts_v2[item] && Object.keys(character().ability_boosts_v2[item]).length > 0}>
                  {renderAbilityBoost(character().ability_boosts_v2[item], item)}
                </Show>
              }
            </For>
          </div>
        </Show>
        <div class="blockable py-4">
          <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-x-2 gap-y-4">
            <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
              {([slug, ability]) =>
                <div>
                  <p class="text-sm uppercase text-center mb-2">{ability}</p>
                  <div class="mx-auto flex items-center justify-center">
                    <p class="text-2xl font-normal!">
                      <Show
                        when={editMode()}
                        fallback={
                          <div class="relative">
                            <Dice
                              width="64"
                              height="64"
                              text={modifier(character().modified_abilities[slug])}
                              textClassList="text-4xl"
                              onClick={() => props.openD20Test(`/check attr ${slug}`, ability, character().modified_abilities[slug])}
                            />
                            <Show when={boosted(abilitiesData()[slug])}>
                              <div class="absolute -top-1 -right-3">
                                <Upgrade width="24" height="24" />
                              </div>
                            </Show>
                          </div>
                        }
                      >
                        {bonusValue(abilitiesData()[slug])}{boosted(abilitiesData()[slug]) ? '+' : ''}
                      </Show>
                    </p>
                  </div>
                  <Show when={editMode()}>
                    <div class="mt-2 flex justify-center gap-2">
                      <Button default size="small" onClick={() => decreaseAbilityValue(slug)}><Minus /></Button>
                      <Button default size="small" onClick={() => increaseAbilityValue(slug)}><Plus /></Button>
                    </div>
                  </Show>
                </div>
              }
            </For>
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
