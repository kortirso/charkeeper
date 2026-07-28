import { createEffect, createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, GuideWrapper, Dice } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'You start with a -2 in all of your Attributes. You then gain Attribute Points to increase whichever Attributes you want, up to the Attribute Limit (3).'
  },
  ru: {
    helpMessage: 'Ваш персонаж начинает с -2 во всех атрибутах. Вы можете потратить Очки Атрибутов для увеличения любых атрибутов вплоть до максимума (3).'
  },
  es: {
    helpMessage: 'Comienzas con un -2 en todos tus Atributos. Luego ganas Puntos de Atributo para aumentar los Atributos que quieras, hasta el Límite de Atributo (3).',
  }
}

export const NimbleAbilities = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(props.character.guide_step === 1);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(character().guide_step === 1);
    });

    setLastActiveCharacterId(character().id);
  });

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData()[slug] === -1) return;

    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => {
    if (abilitiesData()[slug] === 7) return;

    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });
  }

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

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleAbilities' }}>
      <GuideWrapper
        character={character()}
        guideStep={1}
        helpMessage={localize(TRANSLATION, locale()).helpMessage}
        onReloadCharacter={props.onReloadCharacter}
      >
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="character-info-block">
            <div class="grid grid-cols-2 emd:grid-cols-4 gap-x-2 gap-y-4">
              <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
                {([slug, ability]) =>
                  <div>
                    <p class="dc20-ability-title">{ability}</p>
                    <div class="dc20-ability">
                      <p class="text-2xl font-normal!">
                        <Show when={!editMode()} fallback={abilitiesData()[slug]}>
                          <div class="relative pb-4">
                            <Dice
                              width="64"
                              height="64"
                              text={modifier(character().modified_abilities[slug])}
                              textClassList="text-4xl"
                              onClick={() => props.openD20Test(`/check save ${slug}`, ability, character().modified_abilities[slug], 10)}
                            />
                          </div>
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
      </GuideWrapper>
    </ErrorWrapper>
  );
}
