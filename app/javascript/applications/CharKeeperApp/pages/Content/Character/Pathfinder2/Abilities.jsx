import { createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, Dice } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

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
  }
}

export const Pathfinder2Abilities = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const decreaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(false);
    });
  }

  const renderAbilityBoost = (ability_boosts, source) => {
    const result = [];
    Object.keys(ability_boosts).forEach((key) => {
      if (key === 'free') return;

      result.push(`${key.split('_').map((item) => config.abilities[item].name[locale()]).join('/')} - ${ability_boosts[key]}`)
    });
    if (ability_boosts.free) result.push(`${TRANSLATION[locale()].free} - ${ability_boosts.free}`);

    return (
      <p class="text-sm">
        <span class="font-medium!">{TRANSLATION[locale()][source]} </span>
        <span>{result.join('; ')}</span>
      </p>
    );
  }

  const updateCharacter = async () => {
    const transformedAbilities = Object.fromEntries(
      Object.entries(abilitiesData()).map(([key, value]) => [key, (value * 2) + 10])
    );
    const payload = { abilities: transformedAbilities }
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
            <p class="text-sm">{TRANSLATION[locale()].abilityBoosts}</p>
            {renderAbilityBoost(character().ability_boosts_v2.background, 'background')}
            {renderAbilityBoost(character().ability_boosts_v2.race, 'race')}
            {renderAbilityBoost(character().ability_boosts_v2.base, 'base')}
          </div>
        </Show>
        <div class="blockable py-4">
          <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-x-2 gap-y-4">
            <For each={Object.entries(config.abilities).map(([key, values]) => [key, values.name[locale()]])}>
              {([slug, ability]) =>
                <div>
                  <p class="text-sm uppercase text-center mb-2">{ability}</p>
                  <div class="mx-auto flex items-center justify-center">
                    <p class="text-2xl font-normal!">
                      {editMode() ?
                        abilitiesData()[slug] :
                        <Dice
                          width="64"
                          height="64"
                          text={modifier(character().abilities[slug])}
                          textClassList="text-4xl"
                          onClick={() => props.openDiceRoll(`/check attr ${slug}`, character().abilities[slug])}
                        />
                      }
                    </p>
                  </div>
                  <Show when={editMode()}>
                    <div class="mt-2 flex justify-center gap-2">
                      <Button default size="small" onClick={() => decreaseAbilityValue(slug)}>
                        <Minus />
                      </Button>
                      <Button default size="small" onClick={() => increaseAbilityValue(slug)}>
                        <Plus />
                      </Button>
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
