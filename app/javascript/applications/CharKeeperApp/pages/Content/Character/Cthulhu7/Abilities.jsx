import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { Input, ErrorWrapper, EditWrapper, GuideWrapper, Dice } from '../../../../components';
import config from '../../../../data/cthulhu7.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: "Distribute attribute points across your character's attributes.",
    check: 'Ability'
  },
  ru: {
    helpMessage: 'Распределите очки между характеристиками вашего персонажа.',
    check: 'Характеристика'
  },
  es: {
    helpMessage: "Distribuye puntos de atributo entre los atributos de tu personaje.",
    check: 'Atributo'
  }
}

export const Cthulhu7Abilities = (props) => {
  const character = () => props.character;

  const [lastTimestamp, setLastTimestamp] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastTimestamp() === character().updated_at) return;

    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(character().guide_step === 1);
    });

    setLastTimestamp(character().updated_at);
  });

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
      { character: { abilities: abilitiesData(), guide_step: null } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Abilities' }}>
      <EditWrapper editMode={editMode()} onSetEditMode={setEditMode} onCancelEditing={cancelEditing} onSaveChanges={updateCharacter}>
        <GuideWrapper
          character={character()}
          guideStep={1}
          helpMessage={localize(TRANSLATION, locale()).helpMessage}
          onReloadCharacter={props.onReloadCharacter}
          finishGuideStep={true}
        >
          <div class="blockable py-4 px-2 md:px-4">
            <div class="cthulhu-abilities-box">
              <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
                {([slug, trait]) =>
                  <div>
                    <p class="ability-title">{trait}</p>
                      <div class="ability-value-box">
                        <p class="ability-value">
                          <Show
                            when={editMode()}
                            fallback={
                              <div class="flex">
                                <Dice
                                  width="40"
                                  height="40"
                                  text={character().abilities[slug]}
                                  textClassList="text-2xl"
                                  onClick={() => props.openCthulhuTest(`/check attr ${slug}`, `${localize(TRANSLATION, locale()).check}, ${trait}`, character().abilities[slug])}
                                />
                                <div>
                                  <p class="text-sm text-center">{character().abilities[slug] / 2}</p>
                                  <p class="text-sm text-center">{character().abilities[slug] / 5}</p>
                                </div>
                              </div>
                            }
                          >
                            <Input
                              value={abilitiesData()[slug]}
                              onInput={(value) => setAbilitiesData({ ...abilitiesData(), [slug]: value })}
                            />
                          </Show>
                        </p>
                      </div>
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
