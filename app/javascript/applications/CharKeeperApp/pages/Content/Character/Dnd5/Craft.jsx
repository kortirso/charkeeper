import { createSignal, createEffect, createMemo, Show, batch } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Select, Input, Button } from '../../../../components';
import { useAppLocale, useAppState, useAppAlert } from '../../../../context';
import { fetchCraftsRequest } from '../../../../requests/fetchCraftsRequest';
import { createCraftRequest } from '../../../../requests/createCraftRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    noTools: "You don't have the tools you know how to use",
    selectTool: 'Select tool for crafting',
    selectItem: 'Select item for crafting',
    amount: 'Items amount',
    price: 'Price (copper)',
    craftTime: 'Craft time (work days)',
    craft: 'Craft',
    crafted: 'Items are crafted'
  },
  ru: {
    noTools: 'У вас нет иструментов, которыми вы владеете',
    selectTool: 'Выберите инструмент для изготовления предметов',
    selectItem: 'Выберите изготавливаемый предмет',
    amount: 'Количество предметов',
    price: 'Цена (медяки)',
    craftTime: 'Время изготовления (рабочих дней)',
    craft: 'Изготовить',
    crafted: 'Предметы изготовлены'
  }
}

export const Dnd5Craft = (props) => {
  const character = () => props.character;

  const [toolId, setToolId] = createSignal(undefined);
  const [itemId, setItemId] = createSignal(undefined);
  const [craftItem, setCraftItem] = createSignal(undefined);
  const [amount, setAmount] = createSignal(1);
  const [price, setPrice] = createSignal(1);

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [tools, setTools] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchCrafts = async () => await fetchCraftsRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCrafts()]).then(
      ([craftsData]) => {
        setTools(craftsData.tools);
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const craftItems = createMemo(() => {
    if (!toolId()) return [];

    return tools().find(({ id }) => id === toolId()).items;
  });

  const changeTool = (toolId) => {
    const availableItems = tools().find(({ id }) => id === toolId).items;

    batch(() => {
      setToolId(toolId);
      setAmount(1);
      setPrice(1);

      if (availableItems.length === 1) {
        setItemId(availableItems[0].id);
        setCraftItem(availableItems[0]);
      } else {
        setItemId(undefined);
        setCraftItem(undefined);
      }
    });
  }

  const changeCraftItem = (itemId) => {
    const item = craftItems().find(({ id }) => id === itemId);

    batch(() => {
      setItemId(itemId);
      setCraftItem(item);
      setAmount(1);
      setPrice(item.price_per_item * 1);
    });
  }

  const changeAmount = (value) => {
    batch(() => {
      setAmount(value);
      setPrice(craftItem().price_per_item * value);
    });
  }

  const craft = async () => {
    const result = await createCraftRequest(
      appState.accessToken, character().provider, character().id, { item_id: itemId(), amount: Math.trunc(amount()), price: Math.trunc(price()) }
    )

    if (result.errors_list === undefined) {
      renderNotice(localize(TRANSLATION, locale()).crafted);
      props.onReloadCharacter();
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Craft' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <Show
            when={tools().length > 0}
            fallback={
              <p>{localize(TRANSLATION, locale()).noTools}</p>
            }
          >
            <Select
              containerClassList="w-full mb-2"
              labelText={localize(TRANSLATION, locale()).selectTool}
              items={Object.fromEntries(tools().map((item) => [item.id, item.name[locale()]]))}
              selectedValue={toolId()}
              onSelect={changeTool}
            />
            <Show when={toolId()}>
              <Select
                containerClassList="w-full mb-2"
                labelText={localize(TRANSLATION, locale()).selectItem}
                items={Object.fromEntries(craftItems().map((item) => [item.id, item.name[locale()]]))}
                selectedValue={itemId()}
                onSelect={changeCraftItem}
              />
            </Show>
            <Show when={itemId()}>
              <div class="flex gap-x-2 mb-2">
                <Input
                  numeric
                  containerClassList="flex-1"
                  labelText={localize(TRANSLATION, locale()).amount}
                  value={amount()}
                  onInput={changeAmount}
                />
                <Input
                  numeric
                  containerClassList="flex-1"
                  labelText={localize(TRANSLATION, locale()).price}
                  value={price()}
                  onInput={setPrice}
                />
              </div>
              <p class="mb-4">{localize(TRANSLATION, locale()).craftTime} - {amount() / craftItem().output_per_day}</p>
              <Button default onClick={craft}>{localize(TRANSLATION, locale()).craft}</Button>
            </Show>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
