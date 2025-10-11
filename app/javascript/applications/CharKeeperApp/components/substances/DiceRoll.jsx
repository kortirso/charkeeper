import { Portal } from 'solid-js/web';
import { createSignal, Show, batch, Switch, Match } from 'solid-js';

import { Dice, Button } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { clickOutside, modifier } from '../../helpers';
import { createBotRequest } from '../../requests/createBotRequest';

const TRANSLATION = {
  en: {
    advantage: 'Advantage',
    disadvantage: 'Disadvantage',
    roll: 'Roll'
  },
  ru: {
    advantage: 'Преимущество',
    disadvantage: 'Помеха',
    roll: 'Бросить'
  }
}

export const createDiceRoll = () => {
  const [isOpen, setIsOpen] = createSignal(false);

  const [botCommand, setBotCommand] = createSignal('');
  const [bonus, setBonus] = createSignal(0);
  const [additionalBonus, setAdditionalBonus] = createSignal(0);
  const [advantage, setAdvantage] = createSignal(0);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  return {
    openDiceRoll(botCommand, bonus) {
      batch(() => {
        setIsOpen(true);
        setBotCommand(botCommand);
        setBonus(bonus);
      });
    },
    closeDiceRoll() {
      setIsOpen(false);
    },
    DiceRoll(props) {
      const updateAdvantage = (advantageModifier) => {
        if (props.provider === 'dnd') {
          if (advantage() + advantageModifier > 1 || advantage() + advantageModifier < -1) return;

          setAdvantage(advantage() + advantageModifier);
        }
      }

      const makeRoll = async () => {
        const options = [];
        if (advantage() !== 0) options.push(`--adv ${advantage()}`);
        if (bonus() + additionalBonus() !== 0) options.push(`--bonus ${bonus() + additionalBonus()}`);

        const botCommandWithOptions = options.length > 0 ? `${botCommand()} ${options.join(' ')}` : botCommand();

        const result = await createBotRequest(
          appState.accessToken, { source: 'raw', value: botCommandWithOptions, character_id: props.characterId }
        );

        console.log(result);
      }

      return (
        <Portal>
          <Show when={isOpen()}>
            <div
              class="fixed bottom-6 right-6 z-40 bg-black/25 flex items-center justify-center"
              classList={{ 'dark': appState.colorSchema === 'dark' }}
            >
              <div class="p-4 blockable" use:clickOutside={() => setIsOpen(false)}>
                <div class="flex items-center">
                  <Switch>
                    <Match when={props.provider === 'dnd'}>
                      <Dice text="D20" />
                      <Show when={advantage() !== 0}>
                        <div class="ml-2"><Dice text={advantage() > 0 ? 'Adv' : 'Dis'} /></div>
                      </Show>
                      <Show when={bonus() + additionalBonus() !== 0}>
                        <p class="text-xl ml-2 dark:text-snow">{modifier(bonus() + additionalBonus())}</p>
                      </Show>
                    </Match>
                  </Switch>
                </div>
                <div class="flex gap-x-4 mt-4">
                  <div class="flex-1">
                    <p class="mb-1 dice-button" onClick={() => updateAdvantage(1)}>{TRANSLATION[locale()]['advantage']}</p>
                    <p class="dice-button" onClick={() => updateAdvantage(-1)}>{TRANSLATION[locale()]['disadvantage']}</p>
                  </div>
                  <div class="flex-1">
                    <p class="mb-1 py-1 px-2 text-center border border-dusty rounded dark:border-snow dark:text-snow">{additionalBonus()}</p>
                    <div class="flex gap-x-2">
                      <p class="dice-button" onClick={() => setAdditionalBonus(additionalBonus() - 1)}>-</p>
                      <p class="dice-button" onClick={() => setAdditionalBonus(additionalBonus() + 1)}>+</p>
                    </div>
                  </div>
                </div>
                <div class="mt-2">
                  <Button default textable classList="flex-1" onClick={makeRoll}>{TRANSLATION[locale()]['roll']}</Button>
                </div>
              </div>
            </div>
          </Show>
        </Portal>
      );
    }
  }
}
