import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    abilityBoosts: 'You have attribute points for distribution',
    helpMessage: 'Your character can start with a standard set of abilities, or you can generate them in any way according to the rules.'
  },
  ru: {
    abilityBoosts: 'У вас есть очки атрибутов для распределения',
    helpMessage: 'Ваш персонаж может начать со стандартным набором характеристик. Или вы можете сгенерировать их любым способом согласно правилам.'
  }
}

export const FalloutAbilities = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(character().guide_step === 1);
      setLastActiveCharacterId(character().id);
    });
  });

  const spentAbilityPoints = createMemo(() => {
    if (character().ability_boosts === 0) return 0;

    return Object.values(abilitiesData()).reduce((acc, item) => acc + item, 0) - Object.values(character().abilities).reduce((acc, item) => acc + item, 0);
  })

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData()[slug] === 4) return;

    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => {
    if (character().ability_boosts === spentAbilityPoints()) return;
    if (character().max_abilities[slug] && abilitiesData()[slug] === character().max_abilities[slug]) return;
    if (character().max_abilities[slug] === undefined && abilitiesData()[slug] === 10) return;

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
    <ErrorWrapper payload={{ character_id: character().id, key: 'FalloutAbilities' }}>
      <GuideWrapper
        character={character()}
        guideStep={1}
        helpMessage={localize(TRANSLATION, locale()).helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <Show when={character().guide_step && character().ability_boosts > 0}>
          <div class="warning">
            <p class="text-sm">
              {localize(TRANSLATION, locale()).abilityBoosts} - {character().ability_boosts - spentAbilityPoints()}
            </p>
          </div>
        </Show>
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="blockable py-4">
            <div class="flex flex-wrap gap-y-4 justify-center">
              <For each={Object.entries(config.abilities)}>
                {([slug, values]) =>
                  <div class="w-1/4">
                    <p class="text-sm uppercase text-center mb-2">{values.name[locale()]}</p>
                    <p class="text-lg text-center">{abilitiesData()[slug]}</p>
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
