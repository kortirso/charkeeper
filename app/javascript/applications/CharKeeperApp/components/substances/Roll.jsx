import { Portal } from 'solid-js/web';
import { createEffect, createSignal, createMemo, Show, Switch, Match, For, batch } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import { ErrorWrapper, Dice, DualityDice, Button, Checkbox } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { clickOutside, modifier, localize, readFromCache, writeToCache } from '../../helpers';
import { Close, Edit, Minus, Plus } from '../../assets';
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
    damage: 'Damage',
    plotDice: 'Raising the stakes',
    cthulhuStatuses: {
      fumble: 'Fumble',
      crit: 'Crit',
      extreme_success: 'Extreme success',
      hard_success: 'Hard success',
      regular_success: 'Success',
      failure: 'Failure'
    },
    miss: 'Miss',
    nimbleCritable: 'Can crit',
    nimbleMissable: 'Can miss',
    bonus: 'Bonus',
    critbonus: 'Crit bonus',
    primarybonus: 'Primary roll bonus',
    diceAmount: 'Dice amount'
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
    damage: 'Урон',
    plotDice: 'Повышение ставок',
    cthulhuStatuses: {
      fumble: 'Крит провал',
      crit: 'Крит успех',
      extreme_success: 'Полный успех',
      hard_success: 'Трудный успех',
      regular_success: 'Успех',
      failure: 'Провал'
    },
    miss: 'Промах',
    nimbleCritable: 'Может критовать',
    nimbleMissable: 'Может промахнуться',
    bonus: 'Бонус',
    critbonus: 'Бонус крита',
    primarybonus: 'Бонус основного куба',
    diceAmount: 'Кол-во кубов'
  },
  es: {
    advantage: 'Ventaja',
    disadvantage: 'Desventaja',
    roll: 'Tirar',
    crit: 'Crítico',
    hope: 'Esperanza',
    fear: 'Miedo',
    critFailure: 'Fallo crítico',
    attack: 'Ataque',
    damage: 'Daño',
    plotDice: 'Raising the stakes',
    cthulhuStatuses: {
      fumble: 'Fumble',
      crit: 'Crit success',
      extreme_success: 'Extreme success',
      hard_success: 'Hard success',
      regular_success: 'Success',
      failure: 'Failure'
    },
    miss: 'Miss',
    nimbleCritable: 'Can crit',
    nimbleMissable: 'Can miss',
    bonus: 'Bonus',
    critbonus: 'Crit bonus',
    primarybonus: 'Primary roll bonus',
    diceAmount: 'Dice amount'
  }
}
const SINGLE_ADVANTAGE_PROVIDERS = ['dnd', 'cosmere', 'pathfinder'];
const D20_TESTS_PROVIDERS = ['dnd', 'cosmere', 'pathfinder', 'dc20', 'nimble'];
const DH_DICES_CACHE_NAME = 'DhDicesSettings';

export const createRoll = () => {
  // данные для проверки D20
  const [d20Test, setD20Test] = createStore({});
  const [d20TestResult, setD20TestResult] = createSignal(undefined);

  // Данные для проверки Cosmere
  const [plotDices, setPlotDices] = createSignal(0);
  const [plotResult, setPlotResult] = createSignal(undefined);

  // Данные для проверки Cthulhu
  const [cthulhuTest, setCthulhuTest] = createStore({});
  const [cthulhuTestResult, setCthulhuTestResult] = createSignal(undefined);

  // данные для проверки Daggerheart
  const [dualityDices, setDualityDices] = createStore({});
  const [showDhSettings, setShowDhSettings] = createSignal(false);
  const [dualityTest, setDualityTest] = createStore({});
  const [dualityTestResult, setDualityTestResult] = createSignal(undefined);

  // данные для проверки Nimble
  const [nimbleTest, setNimbleTest] = createStore({});
  const [nimbleTestResult, setNimbleTestResult] = createSignal(undefined);

  // данные для общих бросков
  const [dices, setDices] = createStore({});
  const [dicesResult, setDicesResult] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const readDhDicesSettings = async () => {
    const cacheValue = await readFromCache(DH_DICES_CACHE_NAME);
    const settings = cacheValue === null || cacheValue === undefined ? { hopeDice: 'D12', fearDice: 'D12' } : JSON.parse(cacheValue);
    setDualityDices(settings);
  }

  createEffect(() => {
    readDhDicesSettings();
  });

  return {
    openD20Test(command, title, bonus, maxAdv = 1) {
      batch(() => {
        setD20Test({ command: command, title: title, bonus: bonus, maxAdv: maxAdv, adv: 0, addBonus: 0 });
        setD20TestResult(undefined);
      });
    },
    openD20Attack(command, title, bonus, dices, damageBonus, maxAdv = 1) {
      batch(() => {
        setD20Test({ command: command, title: title, bonus: bonus, maxAdv: maxAdv, adv: 0, addBonus: 0 });
        setDices({ dices: dices, damageBonus: damageBonus, title: i18n().damage, open: true });
        setD20TestResult(undefined);
        setDicesResult(undefined);
      });
    },
    openDC20Test(command, title, bonus, adv = 0) {
      batch(() => {
        setD20Test({ command: command, title: title, bonus: bonus, maxAdv: 10, adv: adv, addBonus: 0 });
        setD20TestResult(undefined);
      });
    },
    openCthulhuTest(command, title, dc) {
      batch(() => {
        setCthulhuTest({ command: command, title: title, maxAdv: 2, adv: 0, dc: dc });
        setCthulhuTestResult(undefined);
      });
    },
    openDualityTest(command, title, bonus) {
      batch(() => {
        setDualityTest({ command: command, title: title, bonus: bonus, maxAdv: 1, adv: 0, addBonus: 0 });
        setDualityTestResult(undefined);
      });
    },
    openDualityAttack(command, title, bonus, dices, damageBonus) {
      batch(() => {
        setDualityTest({ command: command, title: title, bonus: bonus, maxAdv: 1, adv: 0, addBonus: 0 });
        setDices({ dices: dices, damageBonus: damageBonus, title: i18n().damage, open: true });
        setDualityTestResult(undefined);
        setDicesResult(undefined);
      });
    },
    openCosmereTest(command, title, bonus, maxAdv = 1) {
      batch(() => {
        setD20Test({ command: command, title: title, bonus: bonus, maxAdv: maxAdv, adv: 0, addBonus: 0 });
        setD20TestResult(undefined);
        setPlotDices(0);
        setPlotResult(undefined);
      });
    },
    openNimbleAttack(command, title, dices, bonus, damage, crit, vicious) {
      const splitted_dice = dices.split('d');
      const diceAmount = parseInt(splitted_dice[0]);
      const diceSize = splitted_dice[1];

      batch(() => {
        setNimbleTest({ command: command, title: title, diceAmount: diceAmount, diceSize: diceSize, bonus: bonus, maxAdv: 10, adv: 0, addBonus: 0, damage: damage, crit: crit, miss: true, critBonus: 0, primaryBonus: 0, vicious: vicious });
        setNimbleTestResult(undefined);
      });
    },
    openDices(dices, damageBonus) {
      batch(() => {
        setDices({ dices: dices, damageBonus: damageBonus, title: i18n().damage, open: true });
        setDicesResult(undefined);
      });
    },
    Roll(props) {
      const open = createMemo(() => {
        return d20Test.command || dualityTest.command || cthulhuTest.command || nimbleTest.command || plotDices() > 0 || dices.open;
      });

      const openRolls = () => {
        batch(() => {
          setDices({ dices: [], damageBonus: 0, open: true });
          setDicesResult(undefined);
        });
      }

      const setDc20HelpDice = (item) => {
        batch(() => {
          setD20Test({ ...d20Test, helpDice: (d20Test.helpDice === item ? null : item) });
          setD20TestResult(undefined);
        });
      }

      const openD20Test = () => {
        batch(() => {
          setD20Test({ command: '/check attr empty', title: null, bonus: 0, maxAdv: 10, adv: 0, addBonus: 0 });
          setD20TestResult(undefined);
        });
      }

      const closeD20Test = () => {
        batch(() => {
          setD20Test(reconcile({}));
          setD20TestResult(undefined);
        });
      }

      const openCthulhuTest = () => {
        batch(() => {
          setCthulhuTest({ command: '/check attr empty', title: null, maxAdv: 2, adv: 0 });
          setCthulhuTestResult(undefined);
        });
      }

      const closeCthulhuTest = () => {
        batch(() => {
          setCthulhuTest(reconcile({}));
          setCthulhuTestResult(undefined);
        });
      }

      const openNimbleTest = () => {
        batch(() => {
          setNimbleTest({ command: '/nimbleAttack', title: null, diceAmount: 1, diceSize: null, bonus: 0, maxAdv: 10, adv: 0, addBonus: 0, crit: true, miss: true, critBonus: 0, primaryBonus: 0, vicious: false });
          setNimbleTestResult(undefined);
        });
      }

      const setNimbleDice = (item) => {
        const diceSize = item.split('D')[1];
        batch(() => {
          if (diceSize !== nimbleTest.diceSize || ['D44', 'D66', 'D88'].includes(item)) {
            setNimbleTest({ ...nimbleTest, diceSize: item.split('D')[1], diceAmount: 1 });
          } else {
            setNimbleTest({ ...nimbleTest, diceAmount: nimbleTest.diceAmount + 1 });
          }
          setNimbleTestResult(undefined);
        });
      }

      const closeNimbleTest = () => {
        batch(() => {
          setNimbleTest(reconcile({}));
          setNimbleTestResult(undefined);
        });
      }

      const openDualityTest = () => {
        batch(() => {
          setDualityTest({ command: '/check attr empty', title: null, bonus: 0, maxAdv: 1, adv: 0, addBonus: 0 });
          setDualityTestResult(undefined);
        });
      }

      const closeDualityTest = () => {
        batch(() => {
          setDualityTest(reconcile({}));
          setDualityTestResult(undefined);
        });
      }

      const openCosmereTest = () => {
        batch(() => {
          setPlotDices(1);
          setPlotResult(undefined);
        });
      }

      const closeCosmereTest = () => {
        batch(() => {
          setPlotDices(0);
          setPlotResult(undefined);
        });
      }

      const close = () => {
        if (!open()) return;

        batch(() => {
          setD20Test(reconcile({}));
          setD20TestResult(undefined);
          setDualityTest(reconcile({}));
          setDualityTestResult(undefined);
          setNimbleTest(reconcile({}));
          setNimbleTestResult(undefined);
          setCthulhuTest(reconcile({}));
          setCthulhuTestResult(undefined);
          setPlotDices(0);
          setPlotResult(undefined);
          setDices(reconcile({}));
          setDicesResult(undefined);
        });
      }

      const calculateDualityCritDamage = (result, crit = true) => {
        if (!result) return;

        let total = 0;
        const rolls = result.rolls.map((item) => {
          if (!item[0].includes('d')) return item;

          const diceValue = parseInt(item[0].split('d')[1]);
          const currentRoll = typeof item[1] === 'string' ? parseInt(item[1].split('+')[0]) : item[1];

          if (crit) {
            total += (diceValue + currentRoll);
            return [item[0], `${currentRoll}+${diceValue}`];
          } else {
            total += currentRoll;
            return [item[0], currentRoll];
          }
        });

        setDicesResult({ rolls: rolls, total: total });
      }

      const performRoll = async () => {
        const rolls = [];
        if (d20Test.command) rolls.push(generateD20Test());
        if (dualityTest.command) rolls.push(generateDualityTest());
        if (cthulhuTest.command) rolls.push(generateCthulhuTest());
        if (nimbleTest.command && nimbleTest.diceSize) rolls.push(generateNimbleTest());
        if (plotDices() > 0) rolls.push(generatePlotTest())
        if (dices.dices) rolls.push(generateDiceRoll());

        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: rolls });
        if (result.errors_list === undefined) {
          let resultsIndex = 0;
          batch(() => {
            if (d20Test.command) {
              setD20TestResult(result.result[resultsIndex].result);
              resultsIndex += 1;
            }
            if (dualityTest.command) {
              setDualityTestResult(result.result[resultsIndex].result);
              resultsIndex += 1;
            }
            if (cthulhuTest.command) {
              setCthulhuTestResult(result.result[resultsIndex].result);
              resultsIndex += 1;
            }
            if (nimbleTest.command && nimbleTest.diceSize) {
              setNimbleTestResult(result.result[resultsIndex].result);
              resultsIndex += 1;
            }
            if (plotDices() > 0) {
              setPlotResult(result.result[resultsIndex].result);
              resultsIndex += 1;
            }
            if (dices.dices) {
              if (dualityTest.command && result.result[0].result.status === 'crit_success') {
                calculateDualityCritDamage(result.result[resultsIndex].result);
              } else {
                setDicesResult(result.result[resultsIndex].result);
              }
              resultsIndex += 1;
            }
          });
        } else renderAlerts(result.errors_list);
      }

      const generateD20Test = () => {
        const options = [];
        if (d20Test.adv > 0) options.push(`--adv ${d20Test.adv}`);
        if (d20Test.adv < 0) options.push(`--dis ${Math.abs(d20Test.adv)}`);
        if (d20Test.bonus + d20Test.addBonus > 0) options.push(`--bonus ${d20Test.bonus + d20Test.addBonus}`);
        if (d20Test.bonus + d20Test.addBonus < 0) options.push(`--penalty ${Math.abs(d20Test.bonus + d20Test.addBonus)}`);
        if (props.provider === 'dc20' && d20Test.helpDice) options.push(`--help ${d20Test.helpDice}`);

        return options.length > 0 ? `${d20Test.command} ${options.join(' ')}` : d20Test.command;
      }

      const generateCthulhuTest = () => {
        const options = [];
        if (cthulhuTest.adv > 0) options.push(`--adv ${cthulhuTest.adv}`);
        if (cthulhuTest.adv < 0) options.push(`--dis ${Math.abs(cthulhuTest.adv)}`);
        if (cthulhuTest.dc) options.push(`--dc ${cthulhuTest.dc}`);

        return options.length > 0 ? `${cthulhuTest.command} ${options.join(' ')}` : cthulhuTest.command;
      }

      const generateNimbleTest = () => {
        const options = [`--crit ${nimbleTest.crit}`, `--miss ${nimbleTest.miss}`, `--vicious ${nimbleTest.vicious}`];
        if (nimbleTest.adv > 0) options.push(`--adv ${nimbleTest.adv}`);
        if (nimbleTest.adv < 0) options.push(`--dis ${Math.abs(nimbleTest.adv)}`);
        if (nimbleTest.bonus + nimbleTest.addBonus > 0) options.push(`--bonus ${nimbleTest.bonus + nimbleTest.addBonus}`);
        if (nimbleTest.bonus + nimbleTest.addBonus < 0) options.push(`--penalty ${Math.abs(nimbleTest.bonus + nimbleTest.addBonus)}`);
        if (nimbleTest.damage) options.push(`--damage ${nimbleTest.damage}`);
        if (nimbleTest.critBonus > 0) options.push(`--critbonus ${nimbleTest.critBonus}`);
        if (nimbleTest.primaryBonus !== 0) options.push(`--primarybonus ${nimbleTest.primaryBonus}`);

        return options.length > 0 ? `${nimbleTest.command} ${nimbleTest.diceAmount}d${nimbleTest.diceSize} ${options.join(' ')}` : nimbleTest.command;
      }

      const generateDualityTest = () => {
        const options = [];
        if (dualityTest.adv > 0) options.push(`--adv ${dualityTest.adv}`);
        if (dualityTest.adv < 0) options.push(`--dis ${Math.abs(dualityTest.adv)}`);
        if (dualityTest.bonus + dualityTest.addBonus > 0) options.push(`--bonus ${dualityTest.bonus + dualityTest.addBonus}`);
        if (dualityTest.bonus + dualityTest.addBonus < 0) options.push(`--penalty ${Math.abs(dualityTest.bonus + dualityTest.addBonus)}`);
        if (dualityTest.adv > 0 && props.advantageDice) options.push(`--advDice ${props.advantageDice}`);
        if (dualityDices.hopeDice !== 'D12') options.push(`--hopeDice ${dualityDices.hopeDice.toLowerCase()}`);
        if (dualityDices.fearDice !== 'D12') options.push(`--fearDice ${dualityDices.fearDice.toLowerCase()}`);

        return options.length > 0 ? `${dualityTest.command} ${options.join(' ')}` : dualityTest.command;
      }

      const generatePlotTest = () => `/plotRoll ${plotDices()}`;

      const generateDiceRoll = () => {
        let value = `/roll ${dices.dices.join(' ').toLowerCase()}`;
        if (dices.damageBonus !== 0) value += ` ${dices.damageBonus}`;

        return value;
      }

      const updateAdvantage = (advantageModifier) => {
        if (SINGLE_ADVANTAGE_PROVIDERS.includes(props.provider)) {
          if (d20Test.adv + advantageModifier > 1) advantageModifier = -1;
          if (d20Test.adv + advantageModifier < -1) advantageModifier = 1;

          batch(() => {
            setD20Test({ ...d20Test, adv: d20Test.adv + advantageModifier });
            setD20TestResult(undefined);
          });
        } else if (props.provider === 'daggerheart') {
          if (dualityTest.adv + advantageModifier > 1) advantageModifier = -1;
          if (dualityTest.adv + advantageModifier < -1) advantageModifier = 1;

          batch(() => {
            setDualityTest({ ...dualityTest, adv: dualityTest.adv + advantageModifier });
            setDualityTestResult(undefined);
          });
        } else if (props.provider === 'dc20' || (props.provider === 'nimble' && !nimbleTest.command)) {
          batch(() => {
            setD20Test({ ...d20Test, adv: d20Test.adv + advantageModifier });
            setD20TestResult(undefined);
          });
        } else if (props.provider === 'nimble' && nimbleTest.command) {
          batch(() => {
            setNimbleTest({ ...nimbleTest, adv: nimbleTest.adv + advantageModifier });
            setNimbleTestResult(undefined);
          });
        } else if (props.provider === 'cthulhu7') {
          batch(() => {
            setCthulhuTest({ ...cthulhuTest, adv: cthulhuTest.adv + advantageModifier });
            setCthulhuTestResult(undefined);
          });
        }
      }

      const rerollD20Test = async (index) => {
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: ['/roll d20'] });

        const newRollResults = [...d20TestResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...d20TestResult().rolls.slice(index + 1)];

        let total = d20Test.bonus + d20Test.addBonus;
        let status = null;
        let finalRoll = 0;

        if (d20Test.adv > 0) {
          const maxRoll = Math.max(...newRollResults.map((item) => item[1]));
          finalRoll = maxRoll;
          total += maxRoll;
          if (maxRoll === 20) status = 'crit_success';
          if (maxRoll === 1) status = 'crit_failure';
        } else if (d20Test.adv < 0) {
          const minRoll = Math.min(...newRollResults.map((item) => item[1]));
          finalRoll = minRoll;
          total += minRoll;
          if (minRoll === 1) status = 'crit_failure';
          if (minRoll === 20) status = 'crit_success';
        } else {
          total += newRollResults[0][1];
          finalRoll = newRollResults[0][1];
          if (newRollResults[0][1] === 1) status = 'crit_failure';
          if (newRollResults[0][1] === 20) status = 'crit_success';
        }

        setD20TestResult({ ...d20TestResult(), rolls: newRollResults, total: total, status: status, final_roll: finalRoll });
      }

      const addDice = (dice) => setDices({ ...dices, dices: [...dices.dices, dice] });

      const setSimpleBonus = (modifier) => {
        batch(() => {
          setDices({ ...dices, damageBonus: dices.damageBonus + modifier });
          if (dicesResult()) setDicesResult({ ...dicesResult(), total: dicesResult().total + modifier });
        });
      }

      const removeDice = (index) => {
        batch(() => {
          const newDices = [...dices.dices.slice(0, index), ...dices.dices.slice(index + 1)];
          setDices({ ...dices, dices: newDices });

          if (dicesResult() === undefined) {
            setDicesResult(undefined);
          } else {
            const newRollResults = [...dicesResult().rolls.slice(0, index), ...dicesResult().rolls.slice(index + 1)];
            const total = newRollResults.reduce((acc, item) => acc + item[1], 0);
            setDicesResult({ ...dicesResult(), rolls: newRollResults, total: total });
          }
        });
      }

      const refreshDice = async (index) => {
        if (dicesResult()) {
          const dice = dicesResult().rolls[index][0]

          const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [`/roll ${dice}`] });
          if (result.errors_list === undefined) {
            const newDamageResults = [...dicesResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...dicesResult().rolls.slice(index + 1)];

            if (dualityTest.command) {
              calculateDualityCritDamage({ rolls: newDamageResults }, dualityTestResult().status === 'crit_success');
            } else {
              const total = newDamageResults.reduce((acc, item) => acc + item[1], 0);
              setDicesResult({ ...dicesResult(), rolls: newDamageResults, total: total });
            }
          } else renderAlerts(result.errors_list);
        } else {
          removeDice(index);
        }
      }

      const changeDhDice = (attribute) => {
        const dice = newDhDice(dualityDices[attribute]);
        setDualityDices({ ...dualityDices, [attribute]: dice });
        writeToCache(DH_DICES_CACHE_NAME, JSON.stringify(dualityDices));
      }

      const newDhDice = (value) => {
        if (value === 'D12') return 'D20';
        if (value === 'D20') return 'D8';
        if (value === 'D8') return 'D10';

        return 'D12';
      }

      const rerollDhDice = async (dice, index) => {
        const result = await createCharacterBotRequest(appState.accessToken, props.characterId, { values: [`/roll ${dice}`] });

        const newRollResults = [...dualityTestResult().rolls.slice(0, index), result.result[0].result.rolls[0], ...dualityTestResult().rolls.slice(index + 1)];

        let total = newRollResults.slice(0, 2).reduce((acc, item) => acc + item[1], 0) + dualityTest.bonus + dualityTest.addBonus;
        if (dualityTest.adv > 0) total += newRollResults[2][1];
        if (dualityTest.adv < 0) total -= newRollResults[2][1];

        let status;
        if (newRollResults[0][1] === newRollResults[1][1]) status = 'crit_success';
        if (newRollResults[0][1] > newRollResults[1][1]) status = 'with_hope';
        if (newRollResults[0][1] < newRollResults[1][1]) status = 'with_fear';

        setDualityTestResult({ ...dualityTestResult(), rolls: newRollResults, total: total, status: status });
        calculateDualityCritDamage(dicesResult(), status === 'crit_success');
      }

      const representPlotRoll = (index) => {
        const value = plotResult().rolls[index];

        if (value === 'light_complication') return '+2';
        if (value === 'heavy_complication') return '+4';
        if (value === 'opportunity') return 'OP';
        return '-';
      }

      const rerollNimble = (kind, index) => {
        if (kind === 'primary_rolls') return;

        const currentValue = nimbleTestResult()[kind].reduce((acc, item) => acc + item, 0);
        const newValue = Math.floor(Math.random() * nimbleTest.diceSize) + 1;
        const newValues = [...nimbleTestResult()[kind].slice(0, index), newValue, ...nimbleTestResult()[kind].slice(index + 1)];

        rollNimbleCrit(kind, newValue, newValues);
        const total = newValues.reduce((acc, item) => acc + item, 0);
        setNimbleTestResult({ ...nimbleTestResult(), total: nimbleTestResult().total - currentValue + total, [kind]: newValues });
      }

      const rollNimbleCrit = (kind, currentValue, newValues) => {
        if (kind !== 'crit_rolls') return;
        if (currentValue !== parseInt(nimbleTest.diceSize)) return;

        const newValue = Math.floor(Math.random() * nimbleTest.diceSize) + 1;
        newValues.push(newValue);
        rollNimbleCrit(kind, newValue, newValues);
      }

      return (
        <Portal>
          <ErrorWrapper payload={{ provider: props.provider, key: 'Roll' }}>
            <div
              class="dice-portal"
              classList={{ 'dark': appState.colorSchema === 'dark', 'w-full sm:w-auto': open() }}
              use:clickOutside={() => close()}
            >
              <div class="dice-tests-box">
                <div class="flex flex-col gap-2 flex-1">
                  {/* Блок для тестов D20 - D&D, DC20, Cosmere, Pathfinder */}
                  <Show when={d20Test.command}>
                    <div class="blockable dice-test">
                      <Show when={d20Test.title}><p>{d20Test.title}</p></Show>
                      <div class="dice-list">
                        <Show
                          when={d20TestResult() === undefined}
                          fallback={
                            <Dice
                              text={d20TestResult().rolls[0][1]}
                              minimum={d20TestResult().rolls[0][1] !== d20TestResult().final_roll}
                              onClick={() => rerollD20Test(0)}
                            />
                          }
                        >
                          <Dice text="D20" />
                        </Show>
                        <Show when={d20Test.adv !== 0}>
                          <For each={Array.from([...Array(Math.abs(d20Test.adv)).keys()], (x) => x + 1)}>
                            {(index) =>
                              <Show
                                when={d20TestResult() === undefined}
                                fallback={
                                  <Dice
                                    text={d20TestResult().rolls[index][1]}
                                    minimum={d20TestResult().rolls[index][1] !== d20TestResult().final_roll}
                                    onClick={() => rerollD20Test(index)}
                                  />
                                }
                              >
                                <Dice text={d20Test.adv > 0 ? 'Adv' : 'Dis'} />
                              </Show>
                            }
                          </For>
                        </Show>
                        <Show when={d20Test.helpDice}>
                          <Show
                            when={d20TestResult() === undefined}
                            fallback={
                              <Dice text={d20TestResult().rolls[d20TestResult().rolls.length - 1][1]} />
                            }
                          >
                            <Dice text={d20Test.helpDice} />
                          </Show>
                        </Show>
                        <Show when={d20Test.bonus + d20Test.addBonus !== 0}>
                          <p class="text-xl ml-2 dark:text-snow">{modifier(d20Test.bonus + d20Test.addBonus)}</p>
                        </Show>
                        <Show when={d20TestResult() !== undefined}>
                          <div class="roll-results">
                            <p class="font-medium! text-xl">{d20TestResult().total}</p>
                            <span class={`roll-result ${d20TestResult().status}`}>
                              <Switch>
                                <Match when={d20TestResult().status === 'crit_success'}>{i18n().crit}</Match>
                                <Match when={d20TestResult().status === 'crit_failure'}>{i18n().critFailure}</Match>
                              </Switch>
                            </span>
                          </div>
                        </Show>
                      </div>
                      <div class="flex gap-x-4">
                        <div class="flex-1">
                          <p
                            class="mb-1 dice-button"
                            onClick={() => d20Test.adv >= d20Test.maxAdv ? null : updateAdvantage(1)}
                          >{i18n().advantage}</p>
                          <p
                            class="dice-button"
                            onClick={() => d20Test.adv <= -d20Test.maxAdv ? null : updateAdvantage(-1)}
                          >{i18n().disadvantage}</p>
                        </div>
                        <div class="flex-1">
                          <p class="total-advantage">{d20Test.addBonus}</p>
                          <div class="flex gap-x-2">
                            <p class="dice-button flex-1" onClick={() => setD20Test({ ...d20Test, addBonus: d20Test.addBonus - 1 })}>-</p>
                            <p class="dice-button flex-1" onClick={() => setD20Test({ ...d20Test, addBonus: d20Test.addBonus + 1 })}>+</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Show>
                  {/* Блок для бросков Cthulhu */}
                  <Show when={cthulhuTest.command}>
                    <div class="blockable dice-test">
                      <Show when={cthulhuTest.title}><p>{cthulhuTest.title}</p></Show>
                      <div class="dice-list">
                        <Show
                          when={cthulhuTestResult() === undefined}
                          fallback={
                            <Dice type="D10" text={cthulhuTestResult().rolls[0][1] === 10 ? '00' : `${cthulhuTestResult().rolls[0][1]}0`} />
                          }
                        >
                          <Dice type="D10" text="x0" />
                        </Show>
                        <Show when={cthulhuTest.adv !== 0}>
                          <For each={Array.from([...Array(Math.abs(cthulhuTest.adv)).keys()], (x) => x + 1)}>
                            {(index) =>
                              <Show
                                when={cthulhuTestResult() === undefined}
                                fallback={
                                  <Dice type="D10" text={cthulhuTestResult().rolls[index + 1][1] === 10 ? '00' : `${cthulhuTestResult().rolls[index + 1][1]}0`} />
                                }
                              >
                                <Dice type="D10" text={cthulhuTest.adv > 0 ? 'Adv' : 'Dis'} />
                              </Show>
                            }
                          </For>
                        </Show>
                        <Show
                          when={cthulhuTestResult() === undefined}
                          fallback={
                            <Dice type="D10" text={cthulhuTestResult().rolls[1][1] === 10 ? 0 : cthulhuTestResult().rolls[1][1]} />
                          }
                        >
                          <Dice type="D10" text="x" />
                        </Show>
                        <Show when={cthulhuTestResult() !== undefined}>
                          <div class="roll-results">
                            <p class="font-medium! text-xl">{cthulhuTestResult().total}</p>
                            <span class={`roll-result ${cthulhuTestResult().status}`}>
                              {i18n().cthulhuStatuses[cthulhuTestResult().status]}
                            </span>
                          </div>
                        </Show>
                      </div>
                      <div class="flex gap-x-4">
                        <div class="flex-1">
                          <p
                            class="mb-1 dice-button"
                            onClick={() => cthulhuTest.adv >= cthulhuTest.maxAdv ? null : updateAdvantage(1)}
                          >{i18n().advantage}</p>
                          <p
                            class="dice-button"
                            onClick={() => cthulhuTest.adv <= -cthulhuTest.maxAdv ? null : updateAdvantage(-1)}
                          >{i18n().disadvantage}</p>
                        </div>
                      </div>
                    </div>
                  </Show>
                  {/* Блок для бросков костей дуализма */}
                  <Show when={dualityTest.command}>
                    <div class="blockable dice-test">
                      <Show when={props.provider === 'daggerheart'}>
                        <Button default classList="weapon-settings min-w-6 min-h-6" onClick={() => setShowDhSettings(!showDhSettings())}><Edit /></Button>
                      </Show>
                      <Show when={dualityTest.title}><p>{dualityTest.title}</p></Show>
                      <div class="dice-list">
                        <Show
                          when={dualityTestResult() === undefined}
                          fallback={
                            <>
                              <Dice mode="hope" type={dualityDices.hopeDice} onClick={() => rerollDhDice(dualityDices.hopeDice.toLowerCase(), 0)} text={dualityTestResult().rolls[0][1]} />
                              <Dice mode="fear" type={dualityDices.fearDice} onClick={() => rerollDhDice(dualityDices.fearDice.toLowerCase(), 1)} text={dualityTestResult().rolls[1][1]} />
                            </>
                          }
                        >
                          <Show when={showDhSettings()}>
                            <p class="dice-button" onClick={() => changeDhDice('hopeDice')}>+</p>
                          </Show>
                          <Dice mode="hope" type={dualityDices.hopeDice} text={dualityDices.hopeDice} />
                          <Show when={showDhSettings()}>
                            <p class="dice-button" onClick={() => changeDhDice('fearDice')}>+</p>
                          </Show>
                          <Dice mode="fear" type={dualityDices.fearDice} text={dualityDices.fearDice} />
                        </Show>
                        <Show when={dualityTest.adv !== 0}>
                          <div class="ml-2">
                            <Show
                              when={dualityTestResult() === undefined}
                              fallback={
                                <Dice type={dualityTest.adv > 0 ? props.advantageDice.toUpperCase() : 'D6'} onClick={() => rerollDhDice('d6', 2)} text={dualityTestResult().rolls[2][1]} />
                              }
                            >
                              <Dice type={dualityTest.adv > 0 ? props.advantageDice.toUpperCase() : 'D6'} text={dualityTest.adv > 0 ? 'Adv' : 'Dis'} />
                            </Show>
                          </div>
                        </Show>
                        <Show when={dualityTest.bonus + dualityTest.addBonus !== 0}>
                          <p class="text-xl ml-2 dark:text-snow">{modifier(dualityTest.bonus + dualityTest.addBonus)}</p>
                        </Show>
                        <Show when={dualityTestResult() !== undefined}>
                          <div class="roll-results">
                            <p class="font-medium! text-xl">{dualityTestResult().total}</p>
                            <span class={`roll-result ${dualityTestResult().status}`}>
                              <Switch>
                                <Match when={dualityTestResult().status === 'crit_success'}>{i18n().crit}</Match>
                                <Match when={dualityTestResult().status === 'with_hope'}>{i18n().hope}</Match>
                                <Match when={dualityTestResult().status === 'with_fear'}>{i18n().fear}</Match>
                              </Switch>
                            </span>
                          </div>
                        </Show>
                      </div>
                      <div class="flex gap-x-4">
                        <div class="flex-1">
                          <p
                            class="mb-1 dice-button"
                            onClick={() => dualityTest.adv >= dualityTest.maxAdv ? null : updateAdvantage(1)}
                          >{i18n().advantage}</p>
                          <p
                            class="dice-button"
                            onClick={() => dualityTest.adv <= -dualityTest.maxAdv ? null : updateAdvantage(-1)}
                          >{i18n().disadvantage}</p>
                        </div>
                        <div class="flex-1">
                          <p class="total-advantage">{dualityTest.addBonus}</p>
                          <div class="flex gap-x-2">
                            <p class="dice-button flex-1" onClick={() => setDualityTest({ ...dualityTest, addBonus: dualityTest.addBonus - 1 })}>-</p>
                            <p class="dice-button flex-1" onClick={() => setDualityTest({ ...dualityTest, addBonus: dualityTest.addBonus + 1 })}>+</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Show>
                  {/* Блок для бросков Nimble */}
                  <Show when={nimbleTest.command}>
                    <div class="blockable dice-test">
                      <Show when={nimbleTest.title}><p>{nimbleTest.title}</p></Show>
                      <div class="dice-list">
                        <Show
                          when={nimbleTestResult() === undefined}
                          fallback={
                            <div class="flex flex-wrap gap-2">
                              <For each={['primary_rolls', 'crit_rolls', 'vicious_rolls', 'secondary_rolls']}>
                                {(kind) =>
                                  <Show when={nimbleTestResult()[kind].length > 0}>
                                    <For each={nimbleTestResult()[kind]}>
                                      {(roll, index) =>
                                        <span class={`text-xl ${kind}`} classList={{ 'cursor-pointer': ['vicious_rolls', 'secondary_rolls'].includes(kind) || kind === 'crit_rolls' && index() === nimbleTestResult()[kind].length - 1 }} onClick={() => rerollNimble(kind, index())}>[{roll}]</span>
                                      }
                                    </For>
                                  </Show>
                                }
                              </For>
                            </div>
                          }
                        >
                          <p>{nimbleTest.diceAmount}x</p>
                          <Show when={nimbleTest.diceSize}>
                            <Dice type={`D${nimbleTest.diceSize}`} text={`D${nimbleTest.diceSize}`} />
                          </Show>
                        </Show>
                        <Show when={nimbleTestResult() === undefined && nimbleTest.adv !== 0}>
                          <div class="ml-2 text-sm">
                            <Dice type={`D${nimbleTest.diceSize}`} text={nimbleTest.adv > 0 ? `Adv${nimbleTest.adv}` : `Dis${Math.abs(nimbleTest.adv)}`} />
                          </div>
                        </Show>
                        <Show when={nimbleTest.bonus + nimbleTest.addBonus !== 0}>
                          <p class="text-xl ml-2 dark:text-snow">{modifier(nimbleTest.bonus + nimbleTest.addBonus)}</p>
                        </Show>
                        <Show when={nimbleTestResult() !== undefined}>
                          <div class="roll-results">
                            <p class="font-medium! text-xl">{nimbleTestResult().total}</p>
                            <Show when={nimbleTestResult().status === 'miss'}>
                              <span class="roll-result miss">{i18n().miss}</span>
                            </Show>
                          </div>
                        </Show>
                      </div>
                      <div class="flex gap-2">
                        <p class="dice-button flex-1" onClick={() => nimbleTest.adv <= -nimbleTest.maxAdv ? null : updateAdvantage(-1)}>{i18n().disadvantage}</p>
                        <p class="dice-button flex-1" onClick={() => nimbleTest.adv >= nimbleTest.maxAdv ? null : updateAdvantage(1)}>{i18n().advantage}</p>
                      </div>
                      <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-4">
                          <p class="text-sm">{i18n().bonus}</p>
                          <Button default size="small" onClick={() => setNimbleTest({ ...nimbleTest, addBonus: nimbleTest.addBonus - 1 })}><Minus /></Button>
                          {nimbleTest.addBonus}
                          <Button default size="small" onClick={() => setNimbleTest({ ...nimbleTest, addBonus: nimbleTest.addBonus + 1 })}><Plus /></Button>
                        </div>
                        <div class="flex items-center gap-4">
                          <p class="text-sm">{i18n().critbonus}</p>
                          <Button default size="small" disable={nimbleTest.critBonus === 0} onClick={() => setNimbleTest({ ...nimbleTest, critBonus: nimbleTest.critBonus - 1 })}><Minus /></Button>
                          {nimbleTest.critBonus}
                          <Button default size="small" onClick={() => setNimbleTest({ ...nimbleTest, critBonus: nimbleTest.critBonus + 1 })}><Plus /></Button>
                        </div>
                        <div class="flex items-center gap-4">
                          <p class="text-sm">{i18n().primarybonus}</p>
                          <Button default size="small" onClick={() => setNimbleTest({ ...nimbleTest, primaryBonus: nimbleTest.primaryBonus - 1 })}><Minus /></Button>
                          {nimbleTest.primaryBonus}
                          <Button default size="small" onClick={() => setNimbleTest({ ...nimbleTest, primaryBonus: nimbleTest.primaryBonus + 1 })}><Plus /></Button>
                        </div>
                        <div class="flex flex-col gap-2">
                          <Checkbox
                            labelText={i18n().nimbleCritable}
                            labelPosition="right"
                            labelClassList="ml-2"
                            checked={nimbleTest.crit}
                            onToggle={() => setNimbleTest({ ...nimbleTest, crit: !nimbleTest.crit })}
                          />
                          <Checkbox
                            labelText={i18n().nimbleMissable}
                            labelPosition="right"
                            labelClassList="ml-2"
                            checked={nimbleTest.miss}
                            onToggle={() => setNimbleTest({ ...nimbleTest, miss: !nimbleTest.miss })}
                          />
                        </div>
                      </div>
                    </div>
                  </Show>
                  {/* Блок для бросков костей истории */}
                  <Show when={plotDices() > 0}>
                    <div class="blockable dice-test">
                      <p>{i18n().plotDice}</p>
                      <div class="dice-list">
                        <Show
                          when={plotResult() === undefined}
                          fallback={
                            <>
                              <Dice type="D6" text={representPlotRoll(0)} />
                              <Show when={plotDices() === 2}><Dice type="D6" text={representPlotRoll(1)} /></Show>
                            </>
                          }
                        >
                          <Dice type="D6" />
                          <Show when={plotDices() === 2}><Dice type="D6" /></Show>
                        </Show>
                      </div>
                      <div class="flex gap-x-2">
                        <p class="dice-button flex-1" onClick={() => plotDices() <= 1 ? null : setPlotDices(plotDices() - 1)}>-</p>
                        <p class="dice-button flex-1" onClick={() => plotDices() >= 2 ? null : setPlotDices(plotDices() + 1)}>+</p>
                      </div>
                    </div>
                  </Show>
                  {/* Блок для всевозможных бросков */}
                  <Show when={dices.open}>
                    <div class="blockable dice-test">
                      <Show when={dices.title}>
                        <p>
                          {dices.title}
                          <Show when={d20Test.title || dualityTest.title}>
                            , {d20Test.title || dualityTest.title}
                          </Show>
                        </p>
                      </Show>
                      <div class="dice-list">
                        <For each={dices.dices}>
                          {(dice, index) =>
                            <Dice
                              type={dice}
                              onClick={() => refreshDice(index())}
                              text={dicesResult() ? (dicesResult().rolls.length - 1 >= index() && dicesResult().rolls[index()][0].includes('d') ? dicesResult().rolls[index()][1] : dice) : dice}
                            />
                          }
                        </For>
                        <Show when={dices.damageBonus !== 0}><p class="text-xl ml-2">{modifier(dices.damageBonus)}</p></Show>
                        <Show when={dicesResult() !== undefined}>
                          <div class="roll-results">
                            <p class="font-medium! text-xl">{dicesResult().total}</p>
                          </div>
                        </Show>
                      </div>
                      <div class="flex gap-x-2">
                        <p class="dice-button flex-1" onClick={() => setSimpleBonus(-1)}>-</p>
                        <p class="dice-button flex-1" onClick={() => setSimpleBonus(1)}>+</p>
                      </div>
                    </div>
                  </Show>
                  {/* Кнопка бросков */}
                  <Show when={open()}>
                    <Button withSuspense default textable classList="flex-1" onClick={performRoll}>
                      {i18n().roll}
                    </Button>
                  </Show>
                  <div class="dice-opens">
                    <Show when={D20_TESTS_PROVIDERS.includes(props.provider)}>
                      <div class="blockable dice-opens-list" classList={{ 'w-auto': open() }}>
                        <Dice
                          onClick={() => d20Test.command ? closeD20Test() : openD20Test()}
                          text={d20Test.command ? <Close /> : 'D20'}
                        />
                      </div>
                    </Show>
                    <Show when={props.provider === 'daggerheart'}>
                      <div class="blockable dice-opens-list" classList={{ 'w-auto': open() }}>
                        <DualityDice onClick={() => dualityTest.command ? closeDualityTest() : openDualityTest()} />
                      </div>
                    </Show>
                    <Show when={props.provider === 'cthulhu7'}>
                      <div class="blockable dice-opens-list" classList={{ 'w-auto': open() }}>
                        <Dice type="D10" text="D100" onClick={() => cthulhuTest.command ? closeCthulhuTest() : openCthulhuTest()} />
                      </div>
                    </Show>
                    <Show when={props.provider === 'cosmere' && d20Test.command}>
                      <div class="blockable dice-opens-list" classList={{ 'w-auto': open() }}>
                        <Dice
                          type="D6"
                          onClick={() => plotDices() > 0 ? closeCosmereTest() : openCosmereTest()}
                          text={plotDices() > 0 ? <Close /> : 'C'}
                        />
                      </div>
                    </Show>
                    <Show when={props.provider === 'nimble' && !open()}>
                      <div class="blockable dice-opens-list" classList={{ 'w-auto': open() }}>
                        <Dice type="D20" text="Nmbl" onClick={() => nimbleTest.command ? closeNimbleTest() : openNimbleTest()} />
                      </div>
                    </Show>
                  </div>
                </div>
                {/* Выбор кубиков */}
                <Show when={props.provider !== 'nimble' && (!open() || dices.open)}>
                  <div class="blockable ml-2 p-2 flex flex-col gap-2" classList={{ 'w-auto': open() }}>
                    <Show when={open()}>
                      <For each={['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D100']}>
                        {(item) =>
                          <Dice type={item === 'D100' ? 'D20' : item} onClick={() => addDice(item)} text={item} />
                        }
                      </For>
                    </Show>
                    <Dice
                      onClick={() => open() ? close() : openRolls()}
                      text={open() ? <Close /> : 'Dx'}
                    />
                  </div>
                </Show>
                {/* Выбор кубиков DC20 */}
                <Show when={props.provider === 'dc20' && d20Test.command}>
                  <div class="blockable ml-2 p-2 flex flex-col gap-2" classList={{ 'w-auto': open() }}>
                    <For each={['D4', 'D6', 'D8', 'D10', 'D12', 'D20']}>
                      {(item) =>
                        <Dice type={item} onClick={() => setDc20HelpDice(item)} text={item} />
                      }
                    </For>
                    <Dice onClick={() => close()} text={<Close />} />
                  </div>
                </Show>
                {/* Выбор кубиков Nimble */}
                <Show when={props.provider === 'nimble' && nimbleTest.command}>
                  <div class="blockable ml-2 p-2 flex flex-col gap-2" classList={{ 'w-auto': open() }}>
                    <For each={['D4', 'D6', 'D8', 'D10', 'D12', 'D20', 'D44', 'D66', 'D88']}>
                      {(item) =>
                        <Dice type={item} onClick={() => setNimbleDice(item)} text={item} />
                      }
                    </For>
                    <Dice onClick={() => close()} text={<Close />} />
                  </div>
                </Show>
              </div>
            </div>
          </ErrorWrapper>
        </Portal>
      );
    }
  }
}
