import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

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
  },
  es: {
    helpMessage: "Distribuye los siguientes modificadores iniciales entre los atributos de tu personaje en el orden que desees: +2, +1, +1, 0, 0, −1.",
    check: 'Atributo'
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

  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales['daggerheart'];
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;
    return locale();
  });

  const decreaseValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] - 1 });
  const increaseValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] + 1 });

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
          helpMessage={localize(TRANSLATION, locale()).helpMessage}
          onReloadCharacter={props.onReloadCharacter}
        >
          <div class="blockable py-4">
            <div class="abilities-box">
              <For each={Object.entries(config.traits).map(([key, values]) => [key, localize(values.name, currentLocale())])}>
                {([slug, trait]) =>
                  <div>
                    <p class="ability-title">{trait}</p>
                    <div class="ability-value-box">
                      <p class="ability-value">
                        {editMode() ?
                          traitsData()[slug] :
                          <Dice
                            width="64"
                            height="64"
                            text={modifier(character().modified_traits[slug])}
                            textClassList="text-4xl"
                            onClick={() => props.openDualityTest(`/check attr ${slug}`, `${localize(TRANSLATION, locale()).check}, ${trait}`, character().modified_traits[slug])}
                          />
                        }
                      </p>
                    </div>
                    <Show when={editMode()}>
                      <div class="ability-changebox">
                        <Button default size="small" onClick={() => decreaseValue(slug)}><Minus /></Button>
                        <Button default size="small" onClick={() => increaseValue(slug)}><Plus /></Button>
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
