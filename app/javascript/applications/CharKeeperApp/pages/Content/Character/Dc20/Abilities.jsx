import { createSignal, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Button, EditWrapper } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    attributePoints: 'Free attribute points',
    pointsAlert: 'Please spend all attribute points',
    spentPointsAlert: 'You spent too much attribute points'
  },
  ru: {
    attributePoints: 'Очки атрибутов для распределения',
    pointsAlert: 'Необходимо распределить все очки атрибутов',
    spentPointsAlert: 'Потрачено слишком много очков атрибутов'
  }
}

export const Dc20Abilities = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [abilitiesData, setAbilitiesData] = createSignal(character().abilities);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData()[slug] === -2) return;

    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => {
    if (abilitiesData()[slug] === Math.round(character().level / 5) + 3) return;

    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });
  }

  const attributePointsLeft = createMemo(() => {
    if (character().attribute_points === 0) return 0;

    const initialSum = Object.values(character().abilities).reduce((acc, value) => acc + value, 0);
    const currentSum = Object.values(abilitiesData()).reduce((acc, value) => acc + value, 0);

    return character().attribute_points - (currentSum - initialSum);
  });

  const cancelEditing = () => {
    batch(() => {
      setAbilitiesData(character().abilities);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    if (character().attribute_points > 0) {
      if (attributePointsLeft() > 0) return renderAlert(TRANSLATION[locale()]['pointsAlert']);
      if (attributePointsLeft() < 0) return renderAlert(TRANSLATION[locale()]['spentPointsAlert']);
    }

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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Abilities' }}>
      <Show when={character().attribute_points > 0}>
        <div class="warning">
          <p class="text-sm">{TRANSLATION[locale()]['attributePoints']} - {attributePointsLeft()}</p>
        </div>
      </Show>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="grid grid-cols-2 emd:grid-cols-4 gap-2">
          <For each={Object.entries(config.abilities).map(([key, values]) => [key, values.name[locale()]])}>
            {([slug, ability]) =>
              <div class="blockable py-4">
                <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{ability}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-normal! dark:text-snow">
                    {editMode() ? abilitiesData()[slug] : modifier(character().abilities[slug])}
                  </p>
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
    </ErrorWrapper>
  );
}
