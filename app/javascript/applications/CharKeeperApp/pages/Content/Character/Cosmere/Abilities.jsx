import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { Button, ErrorWrapper, EditWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/cosmere.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: "Distribute attribute points across your character's attributes.",
    attributeBoosts: 'You have attribute points to spend'
  },
  ru: {
    helpMessage: 'Распределите очки между характеристиками вашего персонажа.',
    attributeBoosts: 'У вас есть очки атрибутов для распределения'
  }
}

export const CosmereAbilities = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);
  const [attributePoints, setAttributePoints] = createSignal(character().attribute_points);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setAbilitiesData(character().abilities);
      setAttributePoints(character().attribute_points);
      setEditMode(character().guide_step === 1);
      setLastActiveCharacterId(character().id);
    });
  });

  const changeValue = (slug, modifier) => {
    batch(() => {
      setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + modifier });
      setAttributePoints(attributePoints() - modifier);
    }); 
  }

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character:
        { abilities: abilitiesData(), guide_step: (character().guide_step ? 2 : null), attribute_points: attributePoints() }
      }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereAbilities' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <GuideWrapper
          character={character()}
          guideStep={1}
          helpMessage={localize(TRANSLATION, locale()).helpMessage}
          onReloadCharacter={props.onReloadCharacter}
        >
          <div class="blockable py-4">
            <Show when={character().attribute_points !== 0}>
              <div class="px-2 md:px-4">
                <div class="warning mb-4">
                  <p class="text-sm text-black!">
                    {localize(TRANSLATION, locale()).attributeBoosts} - {attributePoints()}
                  </p>
                </div>
              </div>
            </Show>
            <div class="abilities-box">
              <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
                {([slug, trait]) =>
                  <div>
                    <p class="ability-title">{trait}</p>
                    <div class="ability-value-box">
                      <p class="ability-value">
                        {editMode() ?
                          abilitiesData()[slug] :
                          abilitiesData()[slug]
                        }
                      </p>
                    </div>
                    <Show when={editMode()}>
                      <div class="ability-changebox">
                        <Button default size="small" onClick={() => abilitiesData()[slug] === 0 ? null : changeValue(slug, -1)}>
                          <Minus />
                        </Button>
                        <Button default size="small" onClick={() => changeValue(slug, 1)}><Plus /></Button>
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
