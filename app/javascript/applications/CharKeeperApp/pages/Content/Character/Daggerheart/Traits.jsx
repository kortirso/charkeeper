import { createSignal, For, Show, batch } from 'solid-js';

import { Button, ErrorWrapper, EditWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

export const DaggerheartTraits = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [traitsData, setTraitsData] = createSignal(character().traits);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const decreaseTraitValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] - 1 });
  const increaseTraitValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] + 1 });

  const cancelEditing = () => {
    batch(() => {
      setTraitsData(character().traits);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { traits: traitsData() } }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartTraits' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="grid grid-cols-3 emd:grid-cols-6 gap-2">
          <For each={Object.entries(config.traits).map(([key, values]) => [key, values.name[locale()]])}>
            {([slug, trait]) =>
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{trait}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-cascadia dark:text-snow">
                    {editMode() ? traitsData()[slug] : modifier(character().modified_traits[slug])}
                  </p>
                </div>
                <Show when={editMode()}>
                  <div class="mt-2 flex justify-center gap-2">
                    <Button default size="small" onClick={() => decreaseTraitValue(slug)}>
                      <Minus />
                    </Button>
                    <Button default size="small" onClick={() => increaseTraitValue(slug)}>
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
