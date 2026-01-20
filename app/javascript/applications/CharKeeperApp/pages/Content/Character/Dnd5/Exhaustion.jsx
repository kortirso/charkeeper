import { Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    exhaustion: 'Exhaustion',
    speedPenalty: 'Your speed decreased by',
    rollPenalty: 'D20 Test result decreased by',
    noPenalty: 'There is no penalty for this condition',
    death: 'Exhaustion 6 - death. Long rest clears one level of exhaustion.'
  },
  ru: {
    exhaustion: 'Истощение',
    speedPenalty: 'Ваша скорость уменьшается на',
    rollPenalty: 'Броски теста D20 уменьшаются на',
    noPenalty: 'Никаких штрафов не применяется',
    death: 'Степень истощения 6 - смерть. Длительный отдых снимает 1 степень истощения.'
  }
}

export const Dnd2024Exhaustion = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const decreaseExhaustion = () => {
    if (character().exhaustion <= 0) return;

    updateCharacter(character().exhaustion - 1);
  }

  const increaseExhaustion = () => {
    if (character().exhaustion >= 6) return;

    updateCharacter(character().exhaustion + 1);
  }

  const updateCharacter = async (value) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { exhaustion: value } }
    );

    if (result.errors_list === undefined) {
      props.onReplaceCharacter(result.character);
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd2024Exhaustion' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <h2 class="text-lg">{TRANSLATION[locale()].exhaustion}</h2>
          <div class="flex justify-between items-center w-24 mt-2">
            <Button default size="small" onClick={decreaseExhaustion}>
              <Minus />
            </Button>
            <p>{character().exhaustion}</p>
            <Button default size="small" onClick={increaseExhaustion}>
              <PlusSmall />
            </Button>
          </div>
          <Show
            when={character().exhaustion > 0}
            fallback={
              <p class="text-sm mt-4">{TRANSLATION[locale()].noPenalty}</p>
            }
          >
            <p class="text-sm mt-4">{TRANSLATION[locale()].speedPenalty} {character().exhaustion * 5}</p>
            <p class="text-sm mt-2">{TRANSLATION[locale()].rollPenalty} {character().exhaustion * 2}</p>
            <p class="text-sm mt-2">{TRANSLATION[locale()].death}</p>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
