import { Portal } from 'solid-js/web';
import { createSignal, Show, batch, Switch, Match, For } from 'solid-js';

import { Dice, DualityDice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, modifier, localize } from '../../helpers';
import { Close } from '../../assets';
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
  const [dualityMode, setDualityMode] = createSignal(false);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  return {
    openDiceRoll(botCommand, bonus) {
      batch(() => {
        setIsOpen('botCommand');
        setBotCommand(botCommand);
        setBonus(bonus);
        setAdditionalBonus(0);
        setRollResult(undefined);
        setAdvantage(0);
      });
    },
    openSimpleDiceRoll(dices, bonus) {
      batch(() => {
        setIsOpen('rollCommand');
        setDices(dices);
        setAdditionalBonus(bonus);
        setRollResult(undefined);
        setAdvantage(0);
      });
    },
    DiceRoll(props) {
      const resetDices = () => {
        batch(() => {
          setIsOpen(undefined);
          setRollResult(undefined);
          setDices([]);
          setAdvantage(0);
        });
      }

      const updateAdvantage = (advantageModifier) => {
        if (props.provider === 'dnd' || props.provider === 'daggerheart') {
          if (advantage() + advantageModifier > 1) advantageModifier = -1;
          if (advantage() + advantageModifier < -1) advantageModifier = 1;

          batch(() => {
            setAdvantage(advantage() + advantageModifier);
            setRollResult(undefined);
          });
        }
        if (props.provider === 'dc20') {
          batch(() => {
            setAdvantage(advantage() + advantageModifier);
            setRollResult(undefined);
          });
        }
      }

      const makeRoll = async () => {
        const options = [];
        if (advantage() > 0) options.push(`--adv ${advantage()}`);
        if (advantage() > 0 && props.advantageDice) options.push(`--advDice ${props.advantageDice}`);
        if (advantage() < 0) options.push(`--dis ${Math.abs(advantage())}`);
        if (bonus() + additionalBonus() > 0) options.push(`--bonus ${bonus() + additionalBonus()}`);
        if (bonus() + additionalBonus() < 0) options.push(`--penalty ${Math.abs(bonus() + additionalBonus())}`);

        const botCommandWithOptions = options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();
        const result = await createBotRequest(
          appState.accessToken, { source: 'raw', value: botCommandWithOptions, character_id: props.characterId }
        );

        setRollResult(result.result);
      }

      const rerollDndDice = async (index) => {
        const result = await createBotRequest(appState.accessToken, { source: 'raw', value: '/roll d20' });

        const newRollResults = [...rollResult().rolls.slice(0, index), result.result.rolls[0], ...rollResult().rolls.slice(index + 1)];

        let total = bonus() + additionalBonus();
        let status = null;
        if (advantage() > 0) {
          const maxRoll = Math.max(...newRollResults.map((item) => item[1]));
          total += maxRoll;
          if (maxRoll === 20) status = 'crit_success';
          if (maxRoll === 1) status = 'crit_failure';
        } else if (advantage() < 0) {
          const minRoll = Math.min(...newRollResults.map((item) => item[1]));
          total += minRoll;
          if (minRoll === 1) status = 'crit_failure';
          if (minRoll === 20) status = 'crit_success';
        } else {
          total += newRollResults[0][1];
          if (newRollResults[0][1] === 1) status = 'crit_failure';
          if (newRollResults[0][1] === 20) status = 'crit_success';
        }

        setRollResult({ ...rollResult(), rolls: newRollResults, total: total, status: status });
      }

      const rerollDhDice = async (dice, index) => {
        const result = await createBotRequest(appState.accessToken, { source: 'raw', value: `/roll ${dice}` });

        const newRollResults = [...rollResult().rolls.slice(0, index), result.result.rolls[0], ...rollResult().rolls.slice(index + 1)];

        let total = newRollResults.slice(0, 2).reduce((acc, item) => acc + item[1], 0) + bonus() + additionalBonus();
        if (advantage() > 0) total += newRollResults[2][1];
        if (advantage() < 0) total -= newRollResults[2][1];

        let status;
        if (newRollResults[0][1] === newRollResults[1][1]) status = 'crit_success';
        if (newRollResults[0][1] > newRollResults[1][1]) status = 'with_hope';
        if (newRollResults[0][1] < newRollResults[1][1]) status = 'with_fear';

        setRollResult({ ...rollResult(), rolls: newRollResults, total: total, status: status });
      }

      const makeSimpleRoll = async () => {
        let value = dualityMode() ? '/dualityRoll' : '/roll'
        value += ` ${dices().join(' ').toLowerCase()}`;
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

      const dualityColor = (index) => {
        if (index === 0) return 'hope';
        if (index === 1) return 'fear';

        return 'default';
      }

      return (
        <Portal>
          <div
            class="fixed bottom-0 right-0 px-6 pb-4 sm:pr-6 z-40 flex items-center justify-end sm:justify-center"
            classList={{ 'dark': appState.colorSchema === 'dark', 'w-full sm:w-auto': isOpen() }}
            use:clickOutside={() => setIsOpen(undefined)}
          >
            <div class="flex-1 flex justify-end items-end">
              <Show when={isOpen() === 'botCommand'}>
                <div class="p-4 blockable w-full sm:w-xs">
                  <div class="flex flex-wrap items-center gap-2">
                    <Switch>
                      <Match when={props.provider === 'dnd'}>
                        <Show
                          when={rollResult() === undefined}
                          fallback={
                            <Dice
                              onClick={() => rerollDndDice(0)}
                              minimum={advantage() !== 0 ? (advantage() > 0 ? rollResult().rolls[1][1] > rollResult().rolls[0][1] : rollResult().rolls[1][1] <= rollResult().rolls[0][1]) : false}
                              text={rollResult().rolls[0][1]}
                            />
                          }
                        >
                          <Dice text="D20" />
                        </Show>
                        <Show when={advantage() !== 0}>
                          <div>
                            <Show
                              when={rollResult() === undefined}
                              fallback={
                                <Dice
                                  onClick={() => rerollDndDice(1)}
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
                              <Dice mode="hope" type="D12" onClick={() => rerollDhDice('d12', 0)} text={rollResult().rolls[0][1]} />
                              <Dice mode="fear" type="D12" onClick={() => rerollDhDice('d12', 1)} text={rollResult().rolls[1][1]} />
                            </>
                          }
                        >
                          <Dice mode="hope" type="D12" text="D12" />
                          <Dice mode="fear" type="D12" text="D12" />
                        </Show>
                        <Show when={advantage() !== 0}>
                          <div class="ml-2">
                            <Show
                              when={rollResult() === undefined}
                              fallback={
                                <Dice type={advantage() > 0 ? props.advantageDice.toUpperCase() : 'D6'} onClick={() => rerollDhDice('d6', 2)} text={rollResult().rolls[2][1]} />
                              }
                            >
                              <Dice type={advantage() > 0 ? props.advantageDice.toUpperCase() : 'D6'} text={advantage() > 0 ? 'Adv' : 'Dis'} />
                            </Show>
                          </div>
                        </Show>
                        <Show when={bonus() + additionalBonus() !== 0}>
                          <p class="text-xl ml-2 dark:text-snow">{modifier(bonus() + additionalBonus())}</p>
                        </Show>
                      </Match>
                      <Match when={props.provider === 'dc20'}>
                        <Show
                          when={rollResult() === undefined}
                          fallback={
                            <Dice
                              text={rollResult().rolls[0][1]}
                              minimum={rollResult().rolls[0][1] !== rollResult().final_roll}
                            />
                          }
                        >
                          <Dice text="D20" />
                        </Show>
                        <Show when={advantage() !== 0}>
                          <For each={Array.from([...Array(Math.abs(advantage())).keys()], (x) => x + 1)}>
                            {(index) =>
                              <div>
                                <Show
                                  when={rollResult() === undefined}
                                  fallback={
                                    <Dice
                                      text={rollResult().rolls[index][1]}
                                      minimum={rollResult().rolls[index][1] !== rollResult().final_roll}
                                    />
                                  }
                                >
                                  <Dice
                                    textClassList="text-sm text-center"
                                    text={advantage() > 0 ? 'Adv' : 'Dis'}
                                  />
                                </Show>
                              </div>
                            }
                          </For>
                        </Show>
                        <Show when={bonus() + additionalBonus() !== 0}>
                          <p class="text-xl ml-2 dark:text-snow">{modifier(bonus() + additionalBonus())}</p>
                        </Show>
                      </Match>
                    </Switch>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex flex-1 items-center justify-end dark:text-snow">
                        <p class="font-medium! text-xl">{rollResult().total}</p>
                        <span class={`roll-result ${rollResult().status}`}>
                          <Switch>
                            <Match when={props.provider === 'dnd' || props.provider === 'dc20'}>
                              <Switch>
                                <Match when={rollResult().status === 'crit_success'}>{localize(TRANSLATION, locale())['crit']}</Match>
                                <Match when={rollResult().status === 'crit_failure'}>{localize(TRANSLATION, locale())['critFailure']}</Match>
                              </Switch>
                            </Match>
                            <Match when={props.provider === 'daggerheart'}>
                              <Switch>
                                <Match when={rollResult().status === 'crit_success'}>{localize(TRANSLATION, locale())['crit']}</Match>
                                <Match when={rollResult().status === 'with_hope'}>{localize(TRANSLATION, locale())['hope']}</Match>
                                <Match when={rollResult().status === 'with_fear'}>{localize(TRANSLATION, locale())['fear']}</Match>
                              </Switch>
                            </Match>
                          </Switch>
                        </span>
                      </div>
                    </Show>
                  </div>
                  <div class="flex gap-x-4 mt-4">
                    <div class="flex-1">
                      <p class="mb-1 dice-button" onClick={() => updateAdvantage(1)}>{localize(TRANSLATION, locale())['advantage']}</p>
                      <p class="dice-button" onClick={() => updateAdvantage(-1)}>{localize(TRANSLATION, locale())['disadvantage']}</p>
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
                    <Button withSuspense default textable classList="flex-1" onClick={makeRoll}>{localize(TRANSLATION, locale())['roll']}</Button>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() === 'rollCommand' && dices().length > 0}>
                <div class="p-4 blockable w-full sm:w-xs">
                  <div class="flex items-center flex-wrap gap-2">
                    <For each={dices()}>
                      {(dice, index) =>
                        <Show
                          when={dualityMode()}
                          fallback={
                            <Dice
                              type={dice}
                              onClick={() => removeDice(index())}
                              text={rollResult() ? (rollResult().rolls.length - 1 >= index() && rollResult().rolls[index()][0].includes('d') ? rollResult().rolls[index()][1] : dice) : dice}
                            />
                          }
                        >
                          <Dice
                            type={dice}
                            onClick={() => removeDice(index())}
                            text={rollResult() ? (rollResult().rolls.length - 1 >= index() && rollResult().rolls[index()][0].includes('d') ? rollResult().rolls[index()][1] : dice) : dice}
                            mode={dualityColor(index())}
                          />
                        </Show>
                      }
                    </For>
                    <Show when={additionalBonus() !== 0}>
                      <p class="text-xl ml-2">{modifier(additionalBonus())}</p>
                    </Show>
                    <Show when={rollResult() !== undefined}>
                      <div class="flex-1 flex items-center justify-end">
                        <p class="font-medium! text-xl">{rollResult().total}</p>
                        <Show when={rollResult().status}>
                          <span class={`roll-result ${rollResult().status}`}>
                            <Switch>
                              <Match when={props.provider === 'daggerheart'}>
                                <Switch>
                                  <Match when={rollResult().status === 'crit_success'}>{localize(TRANSLATION, locale()).crit}</Match>
                                  <Match when={rollResult().status === 'with_hope'}>{localize(TRANSLATION, locale()).hope}</Match>
                                  <Match when={rollResult().status === 'with_fear'}>{localize(TRANSLATION, locale()).fear}</Match>
                                </Switch>
                              </Match>
                            </Switch>
                          </span>
                        </Show>
                      </div>
                    </Show>
                  </div>
                  <div class="mt-4">
                    <div class="flex gap-x-2">
                      <p class="dice-button flex-1" onClick={() => setSimpleBonus(-1)}>-</p>
                      <p class="dice-button flex-1" onClick={() => setSimpleBonus(1)}>+</p>
                    </div>
                  </div>
                  <div class="mt-2 flex gap-x-2">
                    <Button withSuspense default textable classList="flex-1" onClick={makeSimpleRoll}>{localize(TRANSLATION, locale())['roll']}</Button>
                    <Show when={props.provider === 'daggerheart'}>
                      <DualityDice onClick={() => setDualityMode(!dualityMode())} />
                    </Show>
                  </div>
                </div>
              </Show>
              <Show when={isOpen() !== 'botCommand'}>
                <div
                  class="blockable p-2 flex justify-between flex-col gap-2 ml-4"
                  classList={{ 'w-auto': isOpen() }}
                >
                  <Show when={isOpen()}>
                    <Dice type="D4" onClick={() => addDice('D4')} text="D4" />
                    <Dice type="D6" onClick={() => addDice('D6')} text="D6" />
                    <Dice type="D8" onClick={() => addDice('D8')} text="D8" />
                    <Dice type="D10" onClick={() => addDice('D10')} text="D10" />
                    <Dice type="D12" onClick={() => addDice('D12')} text="D12" />
                    <Dice type="D20" onClick={() => addDice('D20')} text="D20" />
                    <Dice type="D20" onClick={() => addDice('D100')} text="D100" />
                  </Show>
                  <Dice
                    onClick={() => isOpen() ? resetDices() : setIsOpen('rollCommand')}
                    text={isOpen() ? <Close /> : 'D20'}
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
