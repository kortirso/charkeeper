import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    abilityBoosts: 'Additionally, distribute 3 points across at least 2 abilities from the list:',
    levelingAbilityBoosts: 'You have available ability boosts',
    splitBoosts: 'Share boosts between:',
    anySplitBoosts: 'Share boosts between any abilities',
    helpMessage: 'Your character can start with a standard set of abilities, or you can generate them in any way according to the rules.',
    check: 'Checking'
  },
  ru: {
    abilityBoosts: 'Дополнительно распределите 3 очка по, как минимум, 2 характеристикам из списка:',
    levelingAbilityBoosts: 'У вас есть доступные повышения характеристик',
    splitBoosts: 'Распределите повышения между:',
    anySplitBoosts: 'Распределите между любыми характеристиками',
    helpMessage: 'Ваш персонаж может начать со стандартным набором характеристик. Или вы можете сгенерировать их любым способом согласно правилам.',
    check: 'Проверка'
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
      setEditMode(character().guide_step === 1);
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
        helpMessage={localize(TRANSLATION, locale())['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
      >
        <Show when={character().guide_step && character().ability_boosts.length > 0}>
          <div class="warning">
            <p class="text-sm">{localize(TRANSLATION, locale())['abilityBoosts']} {Object.entries(config.abilities).filter(([slug]) => character().ability_boosts.includes(slug)).map(([, values]) => values.name[locale()]).join(', ')}</p>
          </div>
        </Show>
        <Show when={character().leveling_ability_boosts > 0}>
          <div class="warning">
            <p class="text-sm">{localize(TRANSLATION, locale())['levelingAbilityBoosts']}, {character().leveling_ability_boosts}</p>
            <Show
              when={character().leveling_ability_boosts_list.length > 0}
              fallback={<p class="text-sm">{localize(TRANSLATION, locale())['anySplitBoosts']}</p>}
            >
              <p class="text-sm">{localize(TRANSLATION, locale())['splitBoosts']} {Object.entries(config.abilities).filter(([slug]) => character().leveling_ability_boosts_list.includes(slug)).map(([, values]) => values.name[locale()]).join(', ')}</p>
            </Show>
          </div>
        </Show>
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="blockable py-4">
            <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-x-2 gap-y-4">
              <For each={Object.entries(config.abilities)}>
                {([slug, values]) =>
                  <div>
                    <p class="text-sm uppercase text-center mb-2">{values.name[locale()]}</p>
                    <div class="w-16 h-16 flex items-center justify-center mx-auto relative">
                      <Dice
                        width="64"
                        height="64"
                        text={modifier(character().modifiers[slug])}
                        textClassList="text-4xl"
                        onClick={() => props.openDiceRoll(`/check attr ${slug}`, character().modifiers[slug], `${localize(TRANSLATION, locale())['check']}, ${values.name[locale()]}`)}
                      />
                      <div class="absolute -right-4 -bottom-0 w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center opacity-75 dark:text-neutral-800">
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
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
