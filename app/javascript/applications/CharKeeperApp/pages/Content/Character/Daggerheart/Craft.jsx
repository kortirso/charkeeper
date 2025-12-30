import { createSignal, createEffect, createMemo, Show, batch } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Select, Input, Button } from '../../../../components';
import { useAppLocale, useAppState, useAppAlert } from '../../../../context';
import { fetchCraftsRequest } from '../../../../requests/fetchCraftsRequest';
import { createCraftRequest } from '../../../../requests/createCraftRequest';

const TRANSLATION = {
  en: {
    noTools: "You don't have the recipes",
    selectTool: 'Select recipe for crafting',
    selectItem: 'Select item for crafting',
    amount: 'Items amount',
    craft: 'Craft',
    crafted: 'Items are crafted'
  },
  ru: {
    noTools: 'У вас нет рецептов',
    selectTool: 'Выберите рецепт для изготовления',
    selectItem: 'Выберите изготавливаемый предмет',
    amount: 'Количество предметов',
    craft: 'Изготовить',
    crafted: 'Предметы изготовлены'
  }
}

export const DaggerheartCraft = (props) => {
  const character = () => props.character;

  const [tool, setTool] = createSignal(undefined);
  const [item, setItem] = createSignal(undefined);
  const [amount, setAmount] = createSignal(1);

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
    if (!tool()) return [];

    return tools().find(({ id }) => id === tool().id).items;
  });

  const changeTool = (toolId) => {
    const selectedTool = tools().find(({ id }) => id === toolId);
    const availableItems = selectedTool.items;

    batch(() => {
      setTool(selectedTool);
      setAmount(1);

      if (availableItems.length === 1) setItem(availableItems[0]);
      else setItem(undefined);
    });
  }

  const changeCraftItem = (itemId) => {
    const selectedItem = tool().items.find(({ id }) => id === itemId);

    batch(() => {
      setItem(selectedItem);
      setAmount(1);
    });
  }

  const craft = async () => {
    const result = await createCraftRequest(
      appState.accessToken, character().provider, character().id, { item_id: item().id, amount: Math.trunc(amount()) }
    )

    if (result.errors_list === undefined) {
      renderNotice(TRANSLATION[locale()].crafted);
      props.onReloadCharacter();
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartCraft' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <Show
            when={tools().length > 0}
            fallback={<p>{TRANSLATION[locale()].noTools}</p>}
          >
            <Select
              containerClassList="w-full"
              labelText={TRANSLATION[locale()].selectTool}
              items={Object.fromEntries(tools().map((item) => [item.id, item.name[locale()]]))}
              selectedValue={tool()?.id}
              onSelect={changeTool}
            />
            <Show when={tool()}>
              <p class="mt-1 text-sm text-stone-800 dark:text-stone-200">{tool().description}</p>
              <Select
                containerClassList="w-full mt-4"
                labelText={TRANSLATION[locale()].selectItem}
                items={Object.fromEntries(craftItems().map((item) => [item.id, item.name[locale()]]))}
                selectedValue={item()?.id}
                onSelect={changeCraftItem}
              />
            </Show>
            <Show when={item()}>
              <Show when={item().description}>
                <p class="mt-1 text-sm text-stone-800 dark:text-stone-200">{item().description}</p>
              </Show>
              <div class="mt-4">
                <Input
                  numeric
                  containerClassList="flex-1"
                  labelText={TRANSLATION[locale()].amount}
                  value={amount()}
                  onInput={setAmount}
                />
              </div>
              <Button default classList="mt-4" onClick={craft}>{TRANSLATION[locale()].craft}</Button>
            </Show>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
