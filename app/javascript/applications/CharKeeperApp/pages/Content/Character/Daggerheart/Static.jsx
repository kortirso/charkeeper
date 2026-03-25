import { createSignal, For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    proficiency: 'Proficiency',
    evasion: 'Evasion',
    armor_score: 'Armor Score',
    rallyDice: 'Rally Dice'
  },
  ru: {
    proficiency: 'Мастерство',
    evasion: 'Уклонение',
    armor_score: 'Очки Доспеха',
    rallyDice: 'Кость сплочения'
  },
  es: {
    proficiency: 'Competencia',
    evasion: 'Evasión',
    armor_score: 'Puntuación de armadura',
    rallyDice: 'Rally Dice'
  }
}

export const DaggerheartStatic = (props) => {
  const character = () => props.character;

  const [rallyDice, setRallyDice] = createSignal(character().rally_dice || 6);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload, only_head: true });
    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStatic' }}>
      <GuideWrapper character={character()}>
        <div class="dh-static-box">
          <div>
            <p class="dh-static-title">{localize(TRANSLATION, locale()).rallyDice}</p>
            <div class="flex justify-center items-center gap-x-4">
              <Button default size="small" onClick={() => rallyDice() === 6 ? null : setRallyDice(rallyDice() - 2)}>
                <Minus />
              </Button>
              <p
                class="text-center uppercase text-lg cursor-pointer"
                classList={{ 'opacity-50': character().rally_dice === null }}
                onClick={() => updateCharacter({ rally_dice: (character().rally_dice ? null : rallyDice()) })}
              >
                D{character().rally_dice || rallyDice()}
              </p>
              <Button default size="small" onClick={() => rallyDice() === 8 ? null : setRallyDice(rallyDice() + 2)}>
                <Plus />
              </Button>
            </div>
          </div>
          <For each={['proficiency', 'evasion', 'armor_score']}>
            {(slug) =>
              <div class="">
                <p class="dh-static-title">{localize(TRANSLATION, locale())[slug]}</p>
                <p class="dh-static-value">{character()[slug]}</p>
              </div>
            }
          </For>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
