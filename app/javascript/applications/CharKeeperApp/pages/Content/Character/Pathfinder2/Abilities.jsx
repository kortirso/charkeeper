import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Levelbox, Button, Input } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus, Edit, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Pathfinder2Abilities = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const decreaseAbilityValue = (slug) => {
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const transformedAbilities = Object.fromEntries(
      Object.entries(abilitiesData()).map(([key, value]) => [key, (value * 2) + 10])
    );
    const payload = {
      abilities: transformedAbilities
    }
    const result = await updateCharacterRequest(appState.accessToken, 'pathfinder2', character().id, { character: payload });

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setAbilitiesData(result.character.abilities);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Abilities' }}>
      <Show when={character().boosts}>
        <div class="bg-blue-200 rounded p-4 mb-2">
          <p
            class="font-cascadia-light text-sm"
            innerHTML={character().boosts} // eslint-disable-line solid/no-innerhtml
          />
        </div>
      </Show>
      <div class="grid grid-cols-3 emd:grid-cols-6 gap-x-4">
        <For each={Object.entries(config.abilities).map(([key, values]) => [key, values.name[locale()]])}>
          {([slug, ability]) =>
            <div class="mb-2 emd:mb-0">
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{ability}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-cascadia dark:text-snow">{modifier(character().abilities[slug])}</p>
                </div>
              </div>
            </div>
          }
        </For>
      </div>
    </ErrorWrapper>
  );
}
