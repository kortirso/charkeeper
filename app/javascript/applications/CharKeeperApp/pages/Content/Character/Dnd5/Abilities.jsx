import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    abilityBoosts: 'Additionally, distribute 3 points across at least 2 abilities from the list:',
    helpMessage: 'Your character can start with a standard set of abilities, or you can generate them in any way according to the rules.'
  },
  ru: {
    abilityBoosts: 'Дополнительно распределите 3 очка по, как минимум, 2 характеристикам из списка:',
    helpMessage: 'Ваш персонаж может начать со стандартным набором характеристик. Или вы можете сгенерировать их любым способом согласно правилам.'
  }
}

export const Dnd5Abilities = (props) => {
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
      setLastActiveCharacterId(character().id);
    });
  });

  const decreaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Abilities' }}>
      <GuideWrapper
        character={character()}
        guideStep={1}
        helpMessage={TRANSLATION[locale()]['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
      >
        <Show when={character().guide_step && character().ability_boosts.length > 0}>
          <div class="warning">
            <p class="text-sm">{TRANSLATION[locale()]['abilityBoosts']} {Object.entries(config.abilities).filter(([slug]) => character().ability_boosts.includes(slug)).map(([, values]) => values.name[locale()]).join(', ')}</p>
          </div>
        </Show>
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-2">
            <For each={Object.entries(config.abilities)}>
              {([slug, values]) =>
                <div class="blockable py-4">
                  <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{values.name[locale()]}</p>
                  <div class="w-16 h-16 flex items-center justify-center mx-auto relative">
                    <Dice
                      width="64"
                      height="64"
                      text={modifier(character().modifiers[slug])}
                      textClassList="text-4xl"
                      onClick={() => props.openDiceRoll(`/check attr ${slug}`, character().modifiers[slug])}
                    />
                    <div class="absolute -right-4 -bottom-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center opacity-75">
                      <p class="text-xl">{editMode() ? abilitiesData()[slug] : character().modified_abilities[slug]}</p>
                    </div>
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
      </GuideWrapper>
    </ErrorWrapper>
  );
}
