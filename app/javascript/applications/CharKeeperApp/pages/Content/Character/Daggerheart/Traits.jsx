import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { Button, ErrorWrapper, EditWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: "Distribute the following starting modifiers across your character's traits in any order you wish: +2, +1, +1, 0, 0, −1.",
    check: 'Trait'
  },
  ru: {
    helpMessage: "Распределите следующие модификаторы между характеристиками вашего персонажа в любом порядке: +2, +1, +1, 0, 0, −1.",
    check: 'Характеристика'
  }
}

export const DaggerheartTraits = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [traitsData, setTraitsData] = createSignal(character().traits);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setTraitsData(character().traits);
      setEditMode(character().guide_step === 1);
      setLastActiveCharacterId(character().id);
    });
  });

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
      appState.accessToken,
      character().provider,
      character().id,
      { character: { traits: traitsData(), guide_step: (character().guide_step ? character().guide_step + 1 : null) } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartTraits' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <GuideWrapper
          character={character()}
          guideStep={1}
          helpMessage={localize(TRANSLATION, locale())['helpMessage']}
          onReloadCharacter={props.onReloadCharacter}
        >
          <div class="blockable py-4">
            <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-x-2 gap-y-4">
              <For each={Object.entries(config.traits).map(([key, values]) => [key, localize(values.name, locale())])}>
                {([slug, trait]) =>
                  <div>
                    <p class="text-sm uppercase text-center mb-2">{trait}</p>
                    <div class="mx-auto flex items-center justify-center">
                      <p class="text-2xl font-normal!">
                        {editMode() ?
                          traitsData()[slug] :
                          <Dice
                            width="64"
                            height="64"
                            text={modifier(character().modified_traits[slug])}
                            textClassList="text-4xl"
                            onClick={() => props.openDiceRoll(`/check attr ${slug}`, character().modified_traits[slug], `${localize(TRANSLATION, locale()).check}, ${trait}`)}
                          />
                        }
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
          </div>
        </GuideWrapper>
      </EditWrapper>
    </ErrorWrapper>
  );
}
