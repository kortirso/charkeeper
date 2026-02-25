import { Portal } from 'solid-js/web';
import { createSignal, Show, batch } from 'solid-js';

import { Dice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, modifier, localize } from '../../helpers';
import { Close } from '../../assets';
import { createCharacterBotRequest } from '../../requests/createCharacterBotRequest';

const TRANSLATION = {
  en: {
    roll: 'Roll'
  },
  ru: {
    roll: 'Бросить'
  }
}

export const createFateDiceRoll = () => {
  const [isOpen, setIsOpen] = createSignal(undefined);

  const [title, setTitle] = createSignal('');
  const [botCommand, setBotCommand] = createSignal('');
  const [bonus, setBonus] = createSignal(0);
  const [additionalBonus, setAdditionalBonus] = createSignal(0);
  const [rollResult, setRollResult] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  return {
    openDiceRoll(botCommand, bonus, title) {
      batch(() => {
        setIsOpen('botCommand');
        setTitle(title);
        setBotCommand(botCommand);
        setBonus(bonus);
        setAdditionalBonus(0);
        setRollResult(undefined);
      });
    },
    openSimpleDiceRoll(dices, bonus) {
      batch(() => {
        setIsOpen('rollCommand');
        setTitle(undefined);
        setAdditionalBonus(bonus);
        setRollResult(undefined);
      });
    },
    DiceRoll(props) {
      const resetDices = () => {
        batch(() => {
          setTitle(undefined);
          setIsOpen(undefined);
          setRollResult(undefined);
        });
      }

      const makeRoll = async () => {
        const options = [];
        if (bonus() + additionalBonus() > 0) options.push(`--bonus ${bonus() + additionalBonus()}`);
        if (bonus() + additionalBonus() < 0) options.push(`--penalty ${Math.abs(bonus() + additionalBonus())}`);

        const botCommandWithOptions = options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [botCommandWithOptions] });

        setRollResult(result.result[0].result);
      }

      const makeSimpleRoll = async () => {
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [`/fateRoll ${additionalBonus()}`] });
        setRollResult(result.result[0].result);
      }

      const setSimpleBonus = (modifier) => {
        batch(() => {
          setAdditionalBonus(additionalBonus() + modifier);
          if (rollResult()) setRollResult({ ...rollResult(), total: rollResult().total + modifier });
        });
      }

      const fateResult = (value) => {
        if (value > 0) return '+';
        if (value < 0) return '-';

        return ''
      }

      return (
        <Portal>
          <div
            class="fixed bottom-0 right-0 px-6 pb-8 sm:pb-4 sm:pr-6 z-40 flex items-center justify-end sm:justify-center"
            classList={{ 'dark': appState.colorSchema === 'dark', 'w-full sm:w-auto': isOpen() }}
            use:clickOutside={() => setIsOpen(undefined)}
          >
            <div class="flex-1 flex justify-end items-end">
              <Show when={isOpen() === 'botCommand'}>
                <div class="p-4 blockable w-full sm:w-xs">
                  <Show when={title()}>
                    <p class="mb-2">{title()}</p>
                  </Show>
                  <div class="flex flex-wrap items-center gap-2">
                    <Show
                      when={rollResult() === undefined}
                      fallback={
                        <>
                          <Dice type="D6" text={fateResult(rollResult().rolls[0])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[1])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[2])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[3])} textClassList="text-2xl!" />
                        </>
                      }
                    >
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                    </Show>
                    <Show when={bonus() + additionalBonus() !== 0}>
                      <p class="text-xl ml-2">{modifier(bonus() + additionalBonus())}</p>
                    </Show>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex flex-1 items-center justify-end">
                        <p class="font-medium! text-xl">{rollResult().total}</p>
                      </div>
                    </Show>
                  </div>
                  <div class="mt-4">
                    <p class="mb-1 py-1 px-2 text-center border border-dusty rounded dark:border-snow dark:text-snow">{additionalBonus()}</p>
                    <div class="flex gap-x-2">
                      <p class="dice-button flex-1" onClick={() => setAdditionalBonus(additionalBonus() - 1)}>-</p>
                      <p class="dice-button flex-1" onClick={() => setAdditionalBonus(additionalBonus() + 1)}>+</p>
                    </div>
                  </div>
                  <div class="mt-2">
                    <Button withSuspense default textable classList="flex-1" onClick={makeRoll}>{localize(TRANSLATION, locale())['roll']}</Button>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() === 'rollCommand'}>
                <div class="p-4 blockable w-full sm:w-xs">
                  <div class="flex items-center flex-wrap gap-2">
                    <Show
                      when={rollResult() === undefined}
                      fallback={
                        <>
                          <Dice type="D6" text={fateResult(rollResult().rolls[0])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[1])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[2])} textClassList="text-2xl!" />
                          <Dice type="D6" text={fateResult(rollResult().rolls[3])} textClassList="text-2xl!" />
                        </>
                      }
                    >
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                      <Dice type="D6" text="D6" />
                    </Show>
                    <Show when={additionalBonus() !== 0}>
                      <p class="text-xl ml-2">{modifier(additionalBonus())}</p>
                    </Show>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex-1 flex items-center justify-end">
                        <p class="font-medium! text-xl">{rollResult().total}</p>
                      </div>
                    </Show>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-x-2">
                      <p class="dice-button flex-1" onClick={() => setSimpleBonus(-1)}>-</p>
                      <p class="dice-button flex-1" onClick={() => setSimpleBonus(1)}>+</p>
                    </div>
                  </div>
                  <div class="mt-2">
                    <Button withSuspense default textable onClick={makeSimpleRoll}>{localize(TRANSLATION, locale())['roll']}</Button>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() !== 'botCommand'}>
                <div
                  class="blockable p-2 flex justify-between flex-col gap-2 ml-4"
                  classList={{ 'w-auto': isOpen() }}
                >
                  <Dice
                    onClick={() => isOpen() ? resetDices() : setIsOpen('rollCommand')}
                    text={isOpen() ? <Close /> : 'F'}
                  />
                </div>
              </Show>
            </div>
          </div>
        </Portal>
      );
    }
  }
}
