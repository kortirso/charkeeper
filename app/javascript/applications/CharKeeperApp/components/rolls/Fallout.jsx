import { Portal } from 'solid-js/web';
import { createSignal, Show, batch, For } from 'solid-js';

import { Dice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, localize } from '../../helpers';
import { createCharacterBotRequest } from '../../requests/createCharacterBotRequest';

const TRANSLATION = {
  en: {
    roll: 'Roll',
    targetNumber: 'Target number',
    successes: 'Successes',
    complications: 'Complications'
  },
  ru: {
    roll: 'Бросить',
    targetNumber: 'Значение успеха',
    successes: 'Успехи',
    complications: 'Осложнения'
  }
}

export const createFalloutDiceRoll = () => {
  const [isOpen, setIsOpen] = createSignal(undefined);

  // upper dice block
  const [title, setTitle] = createSignal('');
  const [botCommand, setBotCommand] = createSignal('');
  const [bonus, setBonus] = createSignal(0);
  const [target, setTarget] = createSignal(0);
  const [expertise, setExpertise] = createSignal(0);

  const [rollResult, setRollResult] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  return {
    openDiceRoll(botCommand, title, target, expertise) {
      batch(() => {
        setIsOpen('botCommand');
        setTitle(title);
        setBotCommand(botCommand);
        setBonus(0);
        setTarget(target);
        setExpertise(expertise);
        setRollResult(undefined);
      });
    },
    DiceRoll(props) {
      const updateBonus = (value) => {
        batch(() => {
          setBonus(value);
          setRollResult(undefined);
        });
      }

      const makeRoll = async () => {
        const result = await createCharacterBotRequest(
          appState.accessToken, props.characterId, { values: [generateCheckRollValue()] }
        );
        setRollResult(result.result[0].result);
      }

      const generateCheckRollValue = () => {
        const options = [`--expertise ${expertise()}`];
        if (bonus() === -1) options.push(`--penalty 1`);
        if (bonus() > 0) options.push(`--bonus ${bonus()}`);
        if (target() > 0) options.push(`--target ${target()}`);

        return options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();
      }

      const rerollDice = async (index) => {
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: ['/roll d20'] });
        const newRollResults = [...rollResult().rolls.slice(0, index), result.result[0].result, ...rollResult().rolls.slice(index + 1)];

        let successes = rollResult().successes;
        let complications = rollResult().complications;

        const oldTotal = rollResult().rolls[index].total;
        const newTotal = result.result[0].result.total;

        if (oldTotal === 20) complications -= 1;
        else if (oldTotal <= expertise()) successes -= 2;
        else if (oldTotal <= target()) successes -= 1;

        if (newTotal === 20) complications += 1;
        else if (newTotal <= expertise()) successes += 2;
        else if (newTotal <= target()) successes += 1;

        setRollResult({ ...rollResult(), rolls: newRollResults, successes: successes, complications: complications });
      }

      const performRoll = () => {
        if (isOpen() === 'botCommand') makeRoll();
      }

      return (
        <Portal>
          <div
            class="fixed bottom-0 right-0 pb-8 px-6 sm:pb-4 sm:pr-6 z-40 flex items-center justify-end sm:justify-center"
            classList={{ 'dark': appState.colorSchema === 'dark', 'w-full sm:w-auto': isOpen() }}
            use:clickOutside={() => setIsOpen(undefined)}
          >
            <div class="flex-1 flex justify-end items-end">
              <div>
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
                            <Dice type="D20" onClick={() => rerollDice(0)} text={rollResult().rolls[0].total} />
                            <Show when={bonus() > -1}>
                              <Dice type="D20" onClick={() => rerollDice(1)} text={rollResult().rolls[1].total} />
                            </Show>
                            <Show when={bonus() > 0}>
                              <For each={[...Array(bonus()).keys()]}>
                                {(item) =>
                                  <Dice type="D20" onClick={() => rerollDice(item + 2)} text={rollResult().rolls[item + 2].total} />
                                }
                              </For>
                            </Show>
                          </>
                        }
                      >
                        <Dice type="D20" text="D20" />
                        <Show when={bonus() > -1}><Dice type="D20" text="D20" /></Show>
                        <Show when={bonus() > 0}>
                          <For each={[...Array(bonus()).keys()]}>
                            {() =>
                              <Dice type="D20" text="D20" />
                            }
                          </For>
                        </Show>
                      </Show>
                    </div>
                    <Show when={rollResult()}>
                      <div class="mt-2">
                        <p>{localize(TRANSLATION, locale()).successes} {rollResult().successes}</p>
                        <p>{localize(TRANSLATION, locale()).complications} {rollResult().complications}</p>
                      </div>
                    </Show>
                    <div class="grid grid-cols-10 gap-x-4 mt-2">
                      <div class="col-span-3">
                        <p class="mb-1 dice-button" onClick={() => bonus() >= 3 ? null : updateBonus(bonus() + 1)}>+D20</p>
                        <p class="dice-button" onClick={() => bonus() <= -1 ? null : updateBonus(bonus() - 1)}>-D20</p>
                      </div>
                      <div class="col-span-7">
                        <p class="text-center text-sm mb-1 px-1 py-1.5 border border-dusty rounded dark:border-snow dark:text-snow">
                          {localize(TRANSLATION, locale()).targetNumber} {target()}
                        </p>
                        <div class="flex gap-x-2">
                          <p class="dice-button flex-1" onClick={() => target() <= expertise() ? null : setTarget(target() - 1)}>-</p>
                          <p class="dice-button flex-1" onClick={() => target() >= 20 ? null : setTarget(target() + 1)}>+</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Show>
                <Show when={isOpen()}>
                  <div class="mt-2">
                    <Button withSuspense default textable classList="flex-1" onClick={performRoll}>
                      {localize(TRANSLATION, locale()).roll}
                    </Button>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </Portal>
      );
    }
  }
}
