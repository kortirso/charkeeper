import { createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

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
      <Show when={character().boosts}>
        <div class="bg-blue-200 rounded p-4 mb-2">
          <p
            class="text-sm"
            innerHTML={character().boosts} // eslint-disable-line solid/no-innerhtml
          />
        </div>
      </Show>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="grid grid-cols-3 emd:grid-cols-6 gap-2">
          <For each={Object.entries(config.abilities).map(([key, values]) => [key, values.name[locale()]])}>
            {([slug, ability]) =>
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{ability}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-normal! dark:text-snow">
                    {editMode() ? abilitiesData()[slug] : modifier(character().abilities[slug])}
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
      </EditWrapper>
    </ErrorWrapper>
  );
}
