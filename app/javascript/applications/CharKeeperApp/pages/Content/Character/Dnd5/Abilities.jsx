import { createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Dnd5Abilities = (props) => {
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

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { abilities: abilitiesData() } }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Abilities' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-2">
          <For each={Object.entries(config.abilities)}>
            {([slug, values]) =>
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{values.name[locale()]}</p>
                <div class="w-16 h-16 flex items-center justify-center mx-auto relative">
                  <p class="text-4xl dark:text-snow">{modifier(character().modifiers[slug])}</p>
                  <div class="absolute -right-4 -bottom-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center opacity-75">
                    <p class="text-xl">{editMode() ? abilitiesData()[slug] : character().abilities[slug]}</p>
                  </div>
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
      </EditWrapper>
    </ErrorWrapper>
  );
}
