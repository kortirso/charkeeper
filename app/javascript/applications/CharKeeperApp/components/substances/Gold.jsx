import { createSignal, createMemo, For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button, Select, Input } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { PlusSmall, Minus } from '../../assets';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    measure: 'Change measure',
    amount: 'Amount',
    negativeMoney: 'Money can not be negative',
    tooMuchMoney: 'Too much money :)',
    daggerheart: {
      coins: 'Coins',
      handfuls: 'Handfuls',
      bags: 'Bags',
      chests: 'Chests'
    },
    dnd: {
      copper: 'Copper',
      silver: 'Silver',
      gold: 'Gold'
    }
  },
  ru: {
    measure: 'Мера изменения',
    amount: 'Кол-во',
    negativeMoney: 'Деньги не могут быть отрицательными',
    tooMuchMoney: 'Указано слишком много денег :)',
    daggerheart: {
      coins: 'Монеты',
      handfuls: 'Горсти',
      bags: 'Мешочки',
      chests: 'Сундучки'
    },
    dnd: {
      copper: 'Медь',
      silver: 'Серебро',
      gold: 'Золото'
    }
  }
}

const divMod = (a, b) => [Math.trunc(a / b), a % b];

export const Gold = (props) => {
  const character = () => props.character;
  const goldFormat = () => props.character.provider === 'daggerheart' ? 'daggerheart' : 'dnd'

  const [measure, setMeasure] = createSignal('coins');
  const [coinsChange, setCoinsChange] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const daggerheartGoldFormat = () => {
    let [chests, chestsless] = divMod(character().money, 1000);
    let [bags, bagsless] = divMod(chestsless, 100);
    let [handfuls, coins] = divMod(bagsless, 10);

    return { chests: chests, bags: bags, handfuls: handfuls, coins: coins };
  }

  const dndGoldFormat = () => {
    let [gold, silverless] = divMod(character().money, 100);
    let [silver, copper] = divMod(silverless, 10);

    return { gold: gold, silver: silver, copper: copper };
  }

  const gold = createMemo(() => {
    if (goldFormat() === 'daggerheart') return daggerheartGoldFormat();
    if (goldFormat() === 'dnd') return dndGoldFormat();
  });

  const updateMoney = async (value) => {
    const moneyChange = coinsChange() * value * (10 ** Object.keys(TRANSLATION.en[goldFormat()]).indexOf(measure()));
    const newAmount = character().money + moneyChange;
    if (newAmount < 0) return renderAlert(TRANSLATION[locale()].negativeMoney);
    if (newAmount > 100000000) return renderAlert(TRANSLATION[locale()].tooMuchMoney);

    const payload = { money: newAmount };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Gold' }}>
      <GuideWrapper character={character()}>
        <div class="blockable mb-2 p-4">
          <div
            classList={{
              'grid grid-cols-2 emd:grid-cols-4': goldFormat() === 'daggerheart',
              'grid grid-cols-3': goldFormat() === 'dnd'
            }}
          >
            <For each={Object.keys(TRANSLATION[locale()][goldFormat()])}>
              {(item) =>
                <div class="flex-1 flex flex-col items-center">
                  <p class="uppercase text-sm mb-1 dark:text-snow">{TRANSLATION[locale()][goldFormat()][item]}</p>
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
              items={TRANSLATION[locale()][goldFormat()]}
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
