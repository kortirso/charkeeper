import { Portal } from 'solid-js/web';
import { createSignal, Show, batch, Switch, Match, For } from 'solid-js';

import { Dice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, modifier } from '../../helpers';
import { createBotRequest } from '../../requests/createBotRequest';

const TRANSLATION = {
  en: {
    advantage: 'Advantage',
    disadvantage: 'Disadvantage',
    roll: 'Roll',
    crit: 'Crit',
    hope: 'Hope',
    fear: 'Fear',
    critFailure: 'Crit fail'
  },
  ru: {
    advantage: 'Преимущество',
    disadvantage: 'Помеха',
    roll: 'Бросить',
    crit: 'Крит',
    hope: 'Надежда',
    fear: 'Страх',
    critFailure: 'Крит провал'
  }
}

export const createDiceRoll = () => {
  const [isOpen, setIsOpen] = createSignal(undefined);

  const [botCommand, setBotCommand] = createSignal('');
  const [bonus, setBonus] = createSignal(0);
  const [additionalBonus, setAdditionalBonus] = createSignal(0);
  const [advantage, setAdvantage] = createSignal(0);
  const [rollResult, setRollResult] = createSignal(undefined);
  const [dices, setDices] = createSignal([]);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  return {
    openDiceRoll(botCommand, bonus) {
      batch(() => {
        setIsOpen('botCommand');
        setBotCommand(botCommand);
        setBonus(bonus);
        setRollResult(undefined);
        setAdvantage(0);
      });
    },
    DiceRoll(props) {
      const updateAdvantage = (advantageModifier) => {
        if (props.provider === 'dnd' || props.provider === 'daggerheart') {
          if (advantage() + advantageModifier > 1 || advantage() + advantageModifier < -1) return;

          batch(() => {
            setAdvantage(advantage() + advantageModifier);
            setRollResult(undefined);
          });
        }
      }

      const makeRoll = async () => {
        const options = [];
        if (advantage() > 0) options.push(`--adv ${advantage()}`);
        if (advantage() < 0) options.push(`--dis ${Math.abs(advantage())}`);
        if (bonus() + additionalBonus() > 0) options.push(`--bonus ${bonus() + additionalBonus()}`);
        if (bonus() + additionalBonus() < 0) options.push(`--penalty ${Math.abs(bonus() + additionalBonus())}`);

        const botCommandWithOptions = options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();
        const result = await createBotRequest(
          appState.accessToken, { source: 'raw', value: botCommandWithOptions, character_id: props.characterId }
        );

        setRollResult(result.result);
      }

      const makeSimpleRoll = async () => {
        let value = `/roll ${dices().join(' ').toLowerCase()}`;
        if (additionalBonus() !== 0) value += ` ${additionalBonus()}`;

        const result = await createBotRequest(appState.accessToken, { source: 'raw', value: value });
        setRollResult(result.result);
      }

      const addDice = (dice) => setDices([...dices(), dice]);

      const setSimpleBonus = (modifier) => {
        batch(() => {
          setAdditionalBonus(additionalBonus() + modifier);
          if (rollResult()) setRollResult({ ...rollResult(), total: rollResult().total + modifier });
        });
      }

      const removeDice = (index) => {
        batch(() => {
          const newDices = [...dices().slice(0, index), ...dices().slice(index + 1)];
          setDices(newDices);

          if (rollResult() === undefined) {
            setRollResult(undefined);
          } else {
            const newRollResults = [...rollResult().rolls.slice(0, index), ...rollResult().rolls.slice(index + 1)];
            const total = newRollResults.reduce((acc, item) => acc + item[1], 0);
            setRollResult({ ...rollResult(), rolls: newRollResults, total: total });
          }
        });
      }

      return (
        <Portal>
          <div
            class="fixed bottom-6 right-6 z-40 flex items-center justify-center"
            classList={{ 'dark': appState.colorSchema === 'dark' }}
            use:clickOutside={() => setIsOpen(undefined)}
          >
            <div class="flex items-end">
              <Show when={isOpen() === 'botCommand'}>
                <div class="p-4 blockable w-xs">
                  <div class="flex justify-between items-center">
                    <div class="flex items-center">
                      <Switch>
                        <Match when={props.provider === 'dnd'}>
                          <Show
                            when={rollResult() === undefined}
                            fallback={
                              <Dice
                                minimum={advantage() !== 0 ? (advantage() > 0 ? rollResult().rolls[1][1] > rollResult().rolls[0][1] : rollResult().rolls[1][1] <= rollResult().rolls[0][1]) : false}
                                text={rollResult().rolls[0][1]}
                              />
                            }
                          >
                            <Dice text="D20" />
                          </Show>
                          <Show when={advantage() !== 0}>
                            <div class="ml-2">
                              <Show
                                when={rollResult() === undefined}
                                fallback={
                                  <Dice
                                    minimum={advantage() > 0 ? rollResult().rolls[1][1] <= rollResult().rolls[0][1] : rollResult().rolls[1][1] > rollResult().rolls[0][1]}
                                    text={rollResult().rolls[1][1]}
                                  />
                                }
                              >
                                <Dice text={advantage() > 0 ? 'Adv' : 'Dis'} />
                              </Show>
                            </div>
                          </Show>
                          <Show when={bonus() + additionalBonus() !== 0}>
                            <p class="text-xl ml-2 dark:text-snow">{modifier(bonus() + additionalBonus())}</p>
                          </Show>
                        </Match>
                        <Match when={props.provider === 'daggerheart'}>
                          <Show
                            when={rollResult() === undefined}
                            fallback={
                              <>
                                <Dice text={rollResult().rolls[0][1]} />
                                <Dice text={rollResult().rolls[1][1]} />
                              </>
                            }
                          >
                            <Dice text="D12" />
                            <Dice text="D12" />
                          </Show>
                          <Show when={advantage() !== 0}>
                            <div class="ml-2">
                              <Show
                                when={rollResult() === undefined}
                                fallback={
                                  <Dice text={rollResult().rolls[2][1]} />
                                }
                              >
                                <Dice text={advantage() > 0 ? 'Adv' : 'Dis'} />
                              </Show>
                            </div>
                          </Show>
                          <Show when={bonus() + additionalBonus() !== 0}>
                            <p class="text-xl ml-2 dark:text-snow">{modifier(bonus() + additionalBonus())}</p>
                          </Show>
                        </Match>
                      </Switch>
                    </div>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex items-center">
                        <p class="font-medium! text-xl dark:text-snow">{rollResult().total}</p>
                        <span class="dark:text-snow text-sm uppercase ml-2">
                          <Switch>
                            <Match when={props.provider === 'dnd'}>
                              <Switch>
                                <Match when={rollResult().status === 'crit_success'}>{TRANSLATION[locale()]['crit']}</Match>
                                <Match when={rollResult().status === 'crit_failure'}>{TRANSLATION[locale()]['critFailure']}</Match>
                              </Switch>
                            </Match>
                            <Match when={props.provider === 'daggerheart'}>
                              <Switch>
                                <Match when={rollResult().status === 'crit_success'}>{TRANSLATION[locale()]['crit']}</Match>
                                <Match when={rollResult().status === 'with_hope'}>{TRANSLATION[locale()]['hope']}</Match>
                                <Match when={rollResult().status === 'with_fear'}>{TRANSLATION[locale()]['fear']}</Match>
                              </Switch>
                            </Match>
                          </Switch>
                        </span>
                      </div>
                    </Show>
                  </div>
                  <div class="flex gap-x-4 mt-4">
                    <div class="flex-1">
                      <p class="mb-1 dice-button" onClick={() => updateAdvantage(1)}>{TRANSLATION[locale()]['advantage']}</p>
                      <p class="dice-button" onClick={() => updateAdvantage(-1)}>{TRANSLATION[locale()]['disadvantage']}</p>
                    </div>
                    <div class="flex-1">
                      <p class="mb-1 py-1 px-2 text-center border border-dusty rounded dark:border-snow dark:text-snow">{additionalBonus()}</p>
                      <div class="flex gap-x-2">
                        <p class="dice-button flex-1" onClick={() => setAdditionalBonus(additionalBonus() - 1)}>-</p>
                        <p class="dice-button flex-1" onClick={() => setAdditionalBonus(additionalBonus() + 1)}>+</p>
                      </div>
                    </div>
                  </div>
                  <div class="mt-2">
                    <Button default textable classList="flex-1" onClick={makeRoll}>{TRANSLATION[locale()]['roll']}</Button>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() === 'rollCommand' && dices().length > 0}>
                <div class="p-4 blockable w-xs">
                  <div class="flex items-center flex-wrap gap-2">
                    <For each={dices()}>
                      {(dice, index) =>
                        <Dice
                          onClick={() => removeDice(index())}
                          text={rollResult() ? (rollResult().rolls.length - 1 >= index() && rollResult().rolls[index()][0].includes('d') ? rollResult().rolls[index()][1] : dice) : dice}
                        />
                      }
                    </For>
                    <Show when={additionalBonus() !== 0}>
                      <p class="text-xl ml-2 dark:text-snow">{modifier(additionalBonus())}</p>
                    </Show>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex-1 flex items-center justify-end">
                        <p class="font-medium! text-xl dark:text-snow">{rollResult().total}</p>
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
                    <Button default textable classList="flex-1" onClick={makeSimpleRoll}>{TRANSLATION[locale()]['roll']}</Button>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() !== 'botCommand'}>
                <div class="ml-4 blockable">
                  <Show when={isOpen()}>
                    <div class="grid grid-cols-1 gap-y-2 p-2">
                      <Dice onClick={() => addDice('D4')} text="D4" />
                      <Dice onClick={() => addDice('D6')} text="D6" />
                      <Dice onClick={() => addDice('D8')} text="D8" />
                      <Dice onClick={() => addDice('D12')} text="D12" />
                      <Dice onClick={() => addDice('D20')} text="D20" />
                      <Dice onClick={() => addDice('D100')} text="D100" />
                    </div>
                  </Show>
                  <div class="p-2">
                    <Dice
                      onClick={() => isOpen() ? setIsOpen(undefined) : setIsOpen('rollCommand')}
                      text={isOpen() ? 'X' : 'D20'}
                    />
                  </div>
                </div>
              </Show>
            </div>
          </div>
        </Portal>
      );
    }
  }
}
