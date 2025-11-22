import { createSignal, createMemo, For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button, Select, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    measure: 'Change measure',
    amount: 'Change amout',
    measures: {
      coins: 'Coins',
      handfuls: 'Handfuls',
      bags: 'Bags',
      chests: 'Chests'
    }
  },
  ru: {
    measure: 'Мера изменения',
    amount: 'Кол-во',
    measures: {
      coins: 'Монеты',
      handfuls: 'Горсти',
      bags: 'Мешочки',
      chests: 'Сундучки'
    }
  }
}

const divMod = (a, b) => [Math.trunc(a / b), a % b];

export const DaggerheartGold = (props) => {
  const character = () => props.character;

  const [measure, setMeasure] = createSignal('coins');
  const [coinsChange, setCoinsChange] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const updateMoney = async (value) => {
    const moneyChange = coinsChange() * value * (10 ** Object.keys(TRANSLATION.en.measures).indexOf(measure()));
    const newAmount = character().money + moneyChange;
    const payload = { money: newAmount };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  const gold = createMemo(() => {
    let [chests, chestsless] = divMod(character().money, 1000);
    let [bags, bagsless] = divMod(chestsless, 100);
    let [handfuls, coins] = divMod(bagsless, 10);

    return { chests: chests, bags: bags, handfuls: handfuls, coins: coins };
  });

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartGold' }}>
      <GuideWrapper character={character()}>
        <div class="blockable mb-2 p-4">
          <div class="grid grid-cols-2 emd:grid-cols-4">
            <For each={['coins', 'handfuls', 'bags', 'chests']}>
              {(item) =>
                <div class="flex-1 flex flex-col items-center">
                  <p class="uppercase text-sm mb-1 dark:text-snow">{TRANSLATION[locale()].measures[item]}</p>
                  <p class="text-2xl mb-1 dark:text-snow">{gold()[item]}</p>
                </div>
              }
            </For>
          </div>
          <div class="flex items-center gap-x-4 mt-2">
            <Button default classList="mt-6" size="small" onClick={() => updateMoney(-1)}><Minus /></Button>
            <Select
              containerClassList="w-40"
              labelText={TRANSLATION[locale()].measure}
              items={TRANSLATION[locale()].measures}
              selectedValue={measure()}
              onSelect={setMeasure}
            />
            <Input
              numeric
              containerClassList="w-20"
              labelText={TRANSLATION[locale()].amount}
              value={coinsChange()}
              onInput={setCoinsChange}
            />
            <Button default classList="mt-6" size="small" onClick={() => updateMoney(1)}><PlusSmall /></Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
