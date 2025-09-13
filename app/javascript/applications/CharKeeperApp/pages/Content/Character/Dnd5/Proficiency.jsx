import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { Minus, Plus } from '../../../../assets';
import { modifier } from '../../../../helpers';

export const Dnd5Proficiency = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const spendDice = async (dice, limit) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] < limit) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] + 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 1 };
    }

    const payload = { spent_hit_dice: newValue };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  const restoreDice = async (dice) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] > 0) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] - 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 0 };
    }
    const payload = { spent_hit_dice: newValue };
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });
    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Proficiency' }}>
      <div class="blockable flex mb-2 p-4">
        <div class="flex-1 flex flex-col items-center">
          <p class="text-sm mb-1 dark:text-snow">{t('terms.proficiencyBonus')}</p>
          <p class="text-2xl mb-1 dark:text-snow">{modifier(character().proficiency_bonus)}</p>
        </div>
        <div class="flex-1">
          <p class="text-center text-sm dark:text-snow">{t('terms.hitDices')}</p>
          <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
            {([dice, maxValue]) =>
              <div class="flex justify-center items-center mt-1">
                <p class="w-8 mr-4 dark:text-snow">d{dice}</p>
                <Button default size="small" onClick={() => character().spent_hit_dice[dice] !== maxValue ? spendDice(dice, maxValue) : null}>
                  <Minus />
                </Button>
                <p class="w-12 mx-1 text-center dark:text-snow">
                  {character().spent_hit_dice[dice] ? (maxValue - character().spent_hit_dice[dice]) : maxValue}/{maxValue}
                </p>
                <Button default size="small" onClick={() => (character().spent_hit_dice[dice] || 0) > 0 ? restoreDice(dice) : null}>
                  <Plus />
                </Button>
              </div>
            }
          </For>
        </div>
      </div>
    </ErrorWrapper>
  );
}
