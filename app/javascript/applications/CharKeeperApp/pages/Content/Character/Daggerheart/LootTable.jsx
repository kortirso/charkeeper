import { createSignal, Show, batch } from 'solid-js';

import { Button, Select, ErrorWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall } from '../../../../assets';
import { createDaggerheartLootRequest } from '../../../../requests/createDaggerheartLootRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Loot tables',
    typeLabel: 'Type',
    rarityLabel: 'Rarity',
    dicesLabel: 'Dices',
    types: {
      item: 'Items table',
      consumables: 'Consumables table'
    },
    rarities: {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      legendary: 'Legendary'
    },
    loot: 'Loot'
  },
  ru: {
    title: 'Таблицы лута',
    typeLabel: 'Тип',
    rarityLabel: 'Редкость',
    dicesLabel: 'Дайсы',
    types: {
      item: 'Предметы',
      consumables: 'Расходники'
    },
    rarities: {
      common: 'Простые',
      uncommon: 'Непростые',
      rare: 'Редкие',
      legendary: 'Легендарные'
    },
    loot: 'Полутать'
  },
  es: {
    title: 'Loot tables',
    typeLabel: 'Type',
    rarityLabel: 'Rarity',
    dicesLabel: 'Dices',
    types: {
      item: 'Items table',
      consumables: 'Consumables table'
    },
    rarities: {
      common: 'Common',
      uncommon: 'Uncommon',
      rare: 'Rare',
      legendary: 'Legendary'
    },
    loot: 'Loot'
  }
}

const RARITY_DICES = {
  common: { 1: 1, 2: 2 },
  uncommon: { 2: 2, 3: 3 },
  rare: { 3: 3, 4: 4 },
  legendary: { 4: 4, 5: 5 }
}

export const DaggerheartLootTable = (props) => {
  const [type, setType] = createSignal('item');
  const [rarity, setRarity] = createSignal('common')
  const [dices, setDices] = createSignal(1);
  const [lootedItem, setLootedItem] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const changeRarity = (value) => {
    batch(() => {
      setRarity(value);
      setDices(Object.values(RARITY_DICES[value])[0]);
    });
  }

  const loot = async () => {
    const result = await createDaggerheartLootRequest(appState.accessToken, 'daggerheart', type(), dices());
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setLootedItem(result.item)
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const buyItem = () => {
    props.buyItem(lootedItem());
    setLootedItem(null);
  }

  return (
    <ErrorWrapper payload={{ key: 'DaggerheartLootTable' }}>
      <div class="blockable px-2 py-4 md:px-4 mt-2">
        <h2 class="equipment-title">{localize(TRANSLATION, locale()).title}</h2>
        <div class="grid grid-cols-5 gap-x-2">
          <Select
            containerClassList="col-span-2"
            labelText={localize(TRANSLATION, locale()).typeLabel}
            items={localize(TRANSLATION, locale()).types}
            selectedValue={type()}
            onSelect={setType}
          />
          <Select
            containerClassList="col-span-2"
            labelText={localize(TRANSLATION, locale()).rarityLabel}
            items={localize(TRANSLATION, locale()).rarities}
            selectedValue={rarity()}
            onSelect={changeRarity}
          />
          <Select
            containerClassList="col-span-1"
            labelText={localize(TRANSLATION, locale()).dicesLabel}
            items={RARITY_DICES[rarity()]}
            selectedValue={dices()}
            onSelect={setDices}
          />
        </div>
        <Button default textable classList="mt-2" onClick={loot}>{localize(TRANSLATION, locale()).loot}</Button>
        <Show when={lootedItem()}>
          <div class="mt-2 flex justify-between items-center">
            <p>{lootedItem().name}</p>
            <Button default size="small" onClick={buyItem}><PlusSmall /></Button>
          </div>
        </Show>
      </div>
    </ErrorWrapper>
  );
}
