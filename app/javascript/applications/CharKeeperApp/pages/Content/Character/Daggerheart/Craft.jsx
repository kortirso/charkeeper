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

  const [toolId, setToolId] = createSignal(undefined);
  const [itemId, setItemId] = createSignal(undefined);
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
    if (!toolId()) return [];

    return tools().find(({ id }) => id === toolId()).items;
  });

  const changeTool = (toolId) => {
    const availableItems = tools().find(({ id }) => id === toolId).items;

    batch(() => {
      setToolId(toolId);
      setAmount(1);

      if (availableItems.length === 1) setItemId(availableItems[0].id);
      else setItemId(undefined);
    });
  }

  const changeCraftItem = (itemId) => {
    batch(() => {
      setItemId(itemId);
      setAmount(1);
    });
  }

  const craft = async () => {
    const result = await createCraftRequest(
      appState.accessToken, character().provider, character().id, { item_id: itemId(), amount: Math.trunc(amount()) }
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
            fallback={
              <p>{TRANSLATION[locale()].noTools}</p>
            }
          >
            <Select
              containerClassList="w-full mb-2"
              labelText={TRANSLATION[locale()].selectTool}
              items={Object.fromEntries(tools().map((item) => [item.id, item.name[locale()]]))}
              selectedValue={toolId()}
              onSelect={changeTool}
            />
            <Show when={toolId()}>
              <Select
                containerClassList="w-full mb-2"
                labelText={TRANSLATION[locale()].selectItem}
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
                  labelText={TRANSLATION[locale()].amount}
                  value={amount()}
                  onInput={setAmount}
                />
              </div>
              <Button default onClick={craft}>{TRANSLATION[locale()].craft}</Button>
            </Show>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
