import { createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Levelbox, Dice } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

export const Pathfinder2SavingThrows = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [savingThrowsData, setSavingThrowsData] = createSignal(character().saving_throws);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const updateSavingThrow = (slug) => {
    const newValue = savingThrowsData()[slug] === 4 ? 0 : (savingThrowsData()[slug] + 1);
    setSavingThrowsData({ ...savingThrowsData(), [slug]: newValue });
  }

  const cancelEditing = () => {
    batch(() => {
      setSavingThrowsData(character().saving_throws);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { saving_throws: savingThrowsData() } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2SavingThrows' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4 flex">
          <For each={Object.entries(config.savingThrows)}>
            {([slug, savingName]) =>
              <div class="flex-1 flex flex-col items-center">
                <p class="text-sm uppercase text-center mb-4">
                  {savingName.name[locale()]}
                </p>
                <div class="flex items-center">
                  <Show
                    when={editMode()}
                    fallback={
                      <p class="text-2xl font-normal!">
                        <Dice
                          text={modifier(character().saving_throws_value[slug])}
                          onClick={() => props.openDiceRoll(`/check save ${slug}`, character().saving_throws_value[slug])}
                        />
                      </p>
                    }
                  >
                    <Levelbox
                      classList="mr-2"
                      value={savingThrowsData()[slug]}
                      onToggle={() => updateSavingThrow(slug)}
                    />
                    <p class="font-normal! text-2xl">{modifier(character().saving_throws_value[slug])}</p>
                  </Show>
                  
                </div>
              </div>
            }
          </For>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
