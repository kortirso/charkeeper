import { Portal } from 'solid-js/web';
import { createSignal, Show, batch, Switch, Match, For } from 'solid-js';

import { Dice, DualityDice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, modifier, localize } from '../../helpers';
import { Close } from '../../assets';
import { createCharacterBotRequest } from '../../requests/createCharacterBotRequest';

const TRANSLATION = {
  en: {
    advantage: 'Advantage',
    disadvantage: 'Disadvantage',
    roll: 'Roll',
    crit: 'Crit',
    hope: 'Hope',
    fear: 'Fear',
    critFailure: 'Crit fail',
    attack: 'Attack',
    damage: 'Damage'
  },
  ru: {
    advantage: 'Преимущество',
    disadvantage: 'Помеха',
    roll: 'Бросить',
    crit: 'Крит',
    hope: 'Надежда',
    fear: 'Страх',
    critFailure: 'Крит провал',
    attack: 'Атака',
    damage: 'Урон'
  }
}

export const createDiceRoll = () => {
  const [isOpen, setIsOpen] = createSignal(undefined);

  // upper dice block
  const [title, setTitle] = createSignal('');
  const [botCommand, setBotCommand] = createSignal('');
  const [bonus, setBonus] = createSignal(0);
  const [additionalBonus, setAdditionalBonus] = createSignal(0);
  const [advantage, setAdvantage] = createSignal(0);

  // lower dice block
  const [dices, setDices] = createSignal([]);
  const [damageBonus, setDamageBonus] = createSignal(0);

  const [rollResult, setRollResult] = createSignal(undefined);
  const [damageResult, setDamageResult] = createSignal(undefined);
  const [dualityMode, setDualityMode] = createSignal(false);

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
        setAdvantage(0);
        setRollResult(undefined);
      });
    },
    openSimpleDiceRoll(dices, bonus) {
      batch(() => {
        setIsOpen('rollCommand');
        setDices(dices);
        setDamageBonus(bonus);
        setDamageResult(undefined);
      });
    },
    openAttackRoll(botCommand, bonus, title, dices, damageBonus) {
      batch(() => {
        setIsOpen('attackCommand');
        setTitle(title);
        setBotCommand(botCommand);
        setBonus(bonus);
        setAdditionalBonus(damageBonus);
        setAdvantage(0);
        setDices(dices);
        setDamageBonus(damageBonus);
        setRollResult(undefined);
        setDamageResult(undefined);
        setDualityMode(false);
      });
    },
    DiceRoll(props) {
      const resetDices = () => {
        batch(() => {
          setIsOpen(undefined);
          setTitle(undefined);
          setDices([]);
          setBonus(0);
          setAdditionalBonus(0);
          setDamageBonus(0);
          setAdvantage(0);
          setRollResult(undefined);
          setDamageResult(undefined);
          setDualityMode(false);
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
        const result = await createCharacterBotRequest(
          appState.accessToken, props.characterId, { values: [generateCheckRollValue()] }
        );
        setRollResult(result.result[0].result);
      }

      const makeSimpleRoll = async () => {
        const result = await createCharacterBotRequest(
          appState.accessToken, props.characterId, { values: [generateDamageRollValue()] }
        );
        setDamageResult(result.result[0].result);
      }

      const makeAttackRoll = async () => {
        const result = await createCharacterBotRequest(
          appState.accessToken, props.characterId, { values: [generateCheckRollValue(), generateDamageRollValue()] }
        );

        batch(() => {
          setRollResult(result.result[0].result);
          setDamageResult(result.result[1].result);
        });
      }

      const generateCheckRollValue = () => {
        const options = [];
        if (advantage() > 0) options.push(`--adv ${advantage()}`);
        if (advantage() > 0 && props.advantageDice) options.push(`--advDice ${props.advantageDice}`);
        if (advantage() < 0) options.push(`--dis ${Math.abs(advantage())}`);
        if (bonus() + additionalBonus() > 0) options.push(`--bonus ${bonus() + additionalBonus()}`);
        if (bonus() + additionalBonus() < 0) options.push(`--penalty ${Math.abs(bonus() + additionalBonus())}`);

        return options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();
      }

      const generateDamageRollValue = () => {
        let value = dualityMode() ? '/dualityRoll' : '/roll'
        value += ` ${dices().join(' ').toLowerCase()}`;
        if (damageBonus() !== 0) value += ` ${damageBonus()}`;

        return value;
      }

      const rerollDndDice = async (index) => {
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: ['/roll d20'] });

        const newRollResults = [...rollResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...rollResult().rolls.slice(index + 1)];

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
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [`/roll ${dice}`] });

        const newRollResults = [...rollResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...rollResult().rolls.slice(index + 1)];

        let total = newRollResults.slice(0, 2).reduce((acc, item) => acc + item[1], 0) + bonus() + additionalBonus();
        if (advantage() > 0) total += newRollResults[2][1];
        if (advantage() < 0) total -= newRollResults[2][1];

        let status;
        if (newRollResults[0][1] === newRollResults[1][1]) status = 'crit_success';
        if (newRollResults[0][1] > newRollResults[1][1]) status = 'with_hope';
        if (newRollResults[0][1] < newRollResults[1][1]) status = 'with_fear';

        setRollResult({ ...rollResult(), rolls: newRollResults, total: total, status: status });
      }

      const addDice = (dice) => setDices([...dices(), dice]);

      const setSimpleBonus = (modifier) => {
        batch(() => {
          setDamageBonus(damageBonus() + modifier);
          if (rollResult()) setRollResult({ ...rollResult(), total: rollResult().total + modifier });
        });
      }

      const removeDice = (index) => {
        batch(() => {
          const newDices = [...dices().slice(0, index), ...dices().slice(index + 1)];
          setDices(newDices);

          if (damageResult() === undefined) {
            setDamageResult(undefined);
          } else {
            const newRollResults = [...damageResult().rolls.slice(0, index), ...damageResult().rolls.slice(index + 1)];
            const total = newRollResults.reduce((acc, item) => acc + item[1], 0);
            setDamageResult({ ...damageResult(), rolls: newRollResults, total: total });
          }
        });
      }

      const refreshDice = async (index) => {
        if (damageResult()) {
          const dice = damageResult().rolls[index][0]

          const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [`/roll ${dice}`] });
          const newDamageResults = [...damageResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...damageResult().rolls.slice(index + 1)];

          const total = newDamageResults.reduce((acc, item) => acc + item[1], 0);
          setDamageResult({ ...damageResult(), rolls: newDamageResults, total: total });
        } else {
          removeDice(index);
        }
      }

      const dualityColor = (index) => {
        if (index === 0) return 'hope';
        if (index === 1) return 'fear';

        return 'default';
      }

      const performRoll = () => {
        if (isOpen() === 'botCommand') makeRoll();
        if (isOpen() === 'rollCommand') makeSimpleRoll();
        if (isOpen() === 'attackCommand') makeAttackRoll();
      }

      return (
        <Portal>
          <div
            class="fixed bottom-0 right-0 px-6 pb-4 sm:pr-6 z-40 flex items-center justify-end sm:justify-center"
            classList={{ 'dark': appState.colorSchema === 'dark', 'w-full sm:w-auto': isOpen() }}
            use:clickOutside={() => setIsOpen(undefined)}
          >
            <div class="flex-1 flex justify-end items-end">
              <div>
                <Show when={isOpen() === 'botCommand' || isOpen() === 'attackCommand'}>
                  <div class="p-4 blockable w-full sm:w-xs">
                    <Show when={title() || isOpen() === 'attackCommand'}>
                      <p class="mb-2">{isOpen() === 'attackCommand' ? `${localize(TRANSLATION, locale()).attack}, ${title()}` : title()}</p>
                    </Show>
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
                  </div>
                </Show>
                <Show when={(isOpen() === 'rollCommand' || isOpen() === 'attackCommand') && dices().length > 0}>
                  <div class="p-4 blockable w-full sm:w-xs mt-2">
                    <Show when={isOpen() === 'attackCommand'}>
                      <p class="mb-2">{localize(TRANSLATION, locale()).damage}, {title()}</p>
                    </Show>
                    <div class="flex items-center flex-wrap gap-2">
                      <For each={dices()}>
                        {(dice, index) =>
                          <Show
                            when={dualityMode()}
                            fallback={
                              <Dice
                                type={dice}
                                onClick={() => refreshDice(index())}
                                text={damageResult() ? (damageResult().rolls.length - 1 >= index() && damageResult().rolls[index()][0].includes('d') ? damageResult().rolls[index()][1] : dice) : dice}
                              />
                            }
                          >
                            <Dice
                              type={dice}
                              onClick={() => removeDice(index())}
                              text={damageResult() ? (damageResult().rolls.length - 1 >= index() && damageResult().rolls[index()][0].includes('d') ? damageResult().rolls[index()][1] : dice) : dice}
                              mode={dualityColor(index())}
                            />
                          </Show>
                        }
                      </For>
                      <Show when={damageBonus() !== 0}>
                        <p class="text-xl ml-2">{modifier(damageBonus())}</p>
                      </Show>
                      <Show when={damageResult() !== undefined}>
                        <div class="flex-1 flex items-center justify-end">
                          <p class="font-medium! text-xl">{damageResult().total}</p>
                          <Show when={damageResult().status}>
                            <span class={`roll-result ${damageResult().status}`}>
                              <Switch>
                                <Match when={props.provider === 'daggerheart'}>
                                  <Switch>
                                    <Match when={damageResult().status === 'crit_success'}>{localize(TRANSLATION, locale()).crit}</Match>
                                    <Match when={damageResult().status === 'with_hope'}>{localize(TRANSLATION, locale()).hope}</Match>
                                    <Match when={damageResult().status === 'with_fear'}>{localize(TRANSLATION, locale()).fear}</Match>
                                  </Switch>
                                </Match>
                              </Switch>
                            </span>
                          </Show>
                        </div>
                      </Show>
                    </div>
                    <div class="mt-4">
                      <div class="flex items-center gap-x-2">
                        <p class="dice-button flex-1" onClick={() => setSimpleBonus(-1)}>-</p>
                        <p class="dice-button flex-1" onClick={() => setSimpleBonus(1)}>+</p>
                        <Show when={props.provider === 'daggerheart' && isOpen() !== 'attackCommand'}>
                          <DualityDice onClick={() => setDualityMode(!dualityMode())} />
                        </Show>
                      </div>
                    </div>
                  </div>
                </Show>
                <Show when={isOpen()}>
                  <div class="mt-2">
                    <Button withSuspense default textable classList="flex-1" onClick={performRoll}>
                      {localize(TRANSLATION, locale())['roll']}
                    </Button>
                  </div>
                </Show>
              </div>
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
