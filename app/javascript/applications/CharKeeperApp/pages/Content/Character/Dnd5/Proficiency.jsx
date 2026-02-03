import { createSignal, For } from 'solid-js';

import { ErrorWrapper, Button, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { Minus, Plus } from '../../../../assets';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    proficiencyBonus: 'Proficiency bonus',
    hitDices: 'Hit dices',
    heroic: 'Heroic inspiration',
    bardic: 'Bardic inspiration'
  },
  ru: {
    proficiencyBonus: 'Бонус мастерства',
    hitDices: 'Кости хитов',
    heroic: 'Героическое вдохновение',
    bardic: 'Бардовское вдохновение'
  }
}

export const Dnd5Proficiency = (props) => {
  const character = () => props.character;

  const [bardic, setBardic] = createSignal(props.character.bardic_inspiration || 6);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const spendDice = (dice, limit) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] < limit) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] + 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 1 };
    }
    updateCharacter({ spent_hit_dice: newValue });
  }

  const restoreDice = (dice) => {
    let newValue;
    if (character().spent_hit_dice[dice] && character().spent_hit_dice[dice] > 0) {
      newValue = { ...character().spent_hit_dice, [dice]: character().spent_hit_dice[dice] - 1 };
    } else {
      newValue = { ...character().spent_hit_dice, [dice]: 0 };
    }
    updateCharacter({ spent_hit_dice: newValue });
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });
    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Proficiency' }}>
      <GuideWrapper character={character()}>
        <div class="blockable mb-2 p-4 dark:text-snow">
          <div class="grid grid-cols-2 emd:grid-cols-4 gap-2">
            <div>
              <p class="text-sm mb-2 text-center h-10">{localize(TRANSLATION, locale())['heroic']}</p>
              <div class="flex justify-center items-center">
                <p
                  class="leading-12 mx-2 text-center uppercase text-lg cursor-pointer"
                  classList={{ 'opacity-50': !character().heroic_inspiration }}
                  onClick={() => updateCharacter({ heroic_inspiration: (character().heroic_inspiration ? false : true) })}
                >
                  HEROIC
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm mb-2 text-center h-10">{localize(TRANSLATION, locale())['bardic']}</p>
              <div class="flex justify-center items-center">
                <Button default size="small" onClick={() => bardic() === 6 ? null : setBardic(bardic() - 2)}>
                  <Minus />
                </Button>
                <p
                  class="w-12 leading-12 mx-2 text-center uppercase text-lg cursor-pointer"
                  classList={{ 'opacity-50': character().bardic_inspiration === null }}
                  onClick={() => updateCharacter({ bardic_inspiration: (character().bardic_inspiration ? null : bardic()) })}
                >
                  D{character().bardic_inspiration || bardic()}
                </p>
                <Button default size="small" onClick={() => bardic() === 12 ? null : setBardic(bardic() + 2)}>
                  <Plus />
                </Button>
              </div>
            </div>
            <div class="flex flex-col items-center">
              <p class="text-sm mb-2 text-center h-10">{localize(TRANSLATION, locale())['proficiencyBonus']}</p>
              <p class="text-2xl leading-12">{modifier(character().proficiency_bonus)}</p>
            </div>
            <div>
              <p class="text-sm mb-2 text-center h-10">{localize(TRANSLATION, locale())['hitDices']}</p>
              <For each={Object.entries(character().hit_dice).filter(([, value]) => value > 0)}>
                {([dice, maxValue]) =>
                  <div class="flex justify-center items-center min-h-12">
                    <Button default size="small" onClick={() => character().spent_hit_dice[dice] !== maxValue ? spendDice(dice, maxValue) : null}>
                      <Minus />
                    </Button>
                    <p class="w-12 ml-4 text-left">D{dice}</p>
                    <p class="w-12 mr-4 text-right">
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
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
