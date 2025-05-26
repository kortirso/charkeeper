import { createSignal, For, Show, batch } from 'solid-js';

import { Button } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus, Edit, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../../../helpers';

export const DaggerheartTraits = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [traitsData, setTraitsData] = createSignal(character().traits);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const decreaseTraitValue = (slug) => {
    setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] - 1 });
  }

  const increaseTraitValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] + 1 });

  const cancelEditing = () => {
    batch(() => {
      setTraitsData(character().traits)
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const payload = {
      traits: traitsData()
    }
    const result = await updateCharacterRequest(appState.accessToken, 'daggerheart', character().id, { character: payload });

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setTraitsData(result.character.traits);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <>
      <div class="white-box flex flex-wrap p-4 pb-0">
        <For each={Object.entries(dict().daggerheart.traits)}>
          {([slug, ability]) =>
            <div class="w-1/3 mb-4">
              <p class="uppercase text-center mb-4">{ability}</p>
              <div class="mx-auto w-20 h-20 rounded-full border border-gray-200 flex items-center justify-center">
                <p class="text-4xl">{editMode() ? modifier(traitsData()[slug]) : modifier(character().modified_traits[slug])}</p>
              </div>
              <Show when={editMode()}>
                <div class="mt-2 flex justify-center gap-2">
                  <Button default size="small" onClick={() => decreaseTraitValue(slug)}>
                    <Minus />
                  </Button>
                  <Button default size="small" onClick={() => increaseTraitValue(slug)}>
                    <PlusSmall />
                  </Button>
                </div>
              </Show>
            </div>
          }
        </For>
      </div>
      <div class="absolute right-4 bottom-4 z-10">
        <Show
          when={editMode()}
          fallback={
            <Button default classList='rounded-full min-w-12 min-h-12 opacity-75' onClick={() => setEditMode(true)}>
              <Edit />
            </Button>
          }
        >
          <div class="flex">
            <Button outlined classList='rounded-full min-w-12 min-h-12 mr-2' onClick={cancelEditing}>
              <Minus />
            </Button>
            <Button default classList='rounded-full min-w-12 min-h-12' onClick={updateCharacter}>
              <Plus />
            </Button>
          </div>
        </Show>
      </div>
    </>
  );
}
