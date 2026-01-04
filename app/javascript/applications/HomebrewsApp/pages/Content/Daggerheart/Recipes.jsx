import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Select, createModal, Checkbox } from '../../../components';
import { Trash, Copy } from '../../../assets';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { fetchDaggerheartRecipes } from '../../../requests/fetchDaggerheartRecipes';
import { createDaggerheartRecipe } from '../../../requests/createDaggerheartRecipe';
import { removeDaggerheartRecipe } from '../../../requests/removeDaggerheartRecipe';
import { copyDaggerheartRecipe } from '../../../requests/copyDaggerheartRecipe';

const TRANSLATION = {
  en: {
    add: 'Add recipe',
    newItemTitle: 'Recipe form',
    tool: 'Tool',
    item: 'Item',
    save: 'Save',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Weapon copy is completed'
  },
  ru: {
    add: 'Добавить рецепт',
    newItemTitle: 'Редактирование рецепта',
    tool: 'Рецепт',
    item: 'Предмет',
    save: 'Сохранить',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступный',
    copyCompleted: 'Копирование рецепта завершено'
  }
}

export const DaggerheartRecipes = () => {
  const [recipeForm, setRecipeForm] = createStore({ tool_id: null, item_id: null, public: false});

  const [recipes, setRecipes] = createSignal(undefined);
  const [tools, setTools] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  const fetchRecipes = async () => await fetchDaggerheartRecipes(appState.accessToken);

  createEffect(() => {
    const fetchTools = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'recipe');
    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', '');

    Promise.all([fetchTools(), fetchItems(), fetchRecipes()]).then(
      ([toolsData, itemsData, recipesData]) => {
        batch(() => {
          setRecipes(recipesData.recipes)
          setTools(toolsData.items.sort((a, b) => a.name[locale()] > b.name[locale()]));
          setItems(itemsData.items.sort((a, b) => a.name[locale()] > b.name[locale()]));
        });
      }
    );
  });

  const filteredRecipes = createMemo(() => {
    if (recipes() === undefined) return [];

    return recipes().filter(({ own }) => open() ? !own : own);
  });

  const openCreateRecipeModal = () => {
    batch(() => {
      setRecipeForm({ tool_id: null, item_id: null, public: false });
      openModal();
    });
  }

  const createRecipe = async () => {
    if (!recipeForm.tool_id) return;
    if (!recipeForm.item_id) return;

    const result = await createDaggerheartRecipe(appState.accessToken, { recipe: recipeForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setRecipes([result.recipe].concat(recipes()));
        setRecipeForm({ tool_id: null, item_id: null, public: false });
        closeModal();
      });
    }
  }

  const removeRecipe = async (item) => {
    const result = await removeDaggerheartRecipe(appState.accessToken, item.id);

    if (result.errors_list === undefined) {
      setRecipes(recipes().filter(({ id }) => id !== item.id ));
    }
  }

  const copyRecipe = async (itemId) => {
    await copyDaggerheartRecipe(appState.accessToken, itemId);
    const result = await fetchRecipes();

    batch(() => {
      setItems(result.recipes);
      renderNotice(TRANSLATION[locale()].copyCompleted);
    })
  }

  return (
    <Show when={recipes() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateRecipeModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredRecipes().length > 0}>
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1">{TRANSLATION[locale()].tool}</td>
              <td class="p-1">{TRANSLATION[locale()].item}</td>
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={filteredRecipes()}>
              {(item) =>
                <tr>
                  <td class="minimum-width py-1">{tools().find(({ id }) => id === item.tool_id).name[locale()]}</td>
                  <td class="minimum-width py-1">{items().find(({ id }) => id === item.item_id).name[locale()]}</td>
                  <td>
                    <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                      <Show
                        when={!open()}
                        fallback={
                          <Button default classList="px-2 py-1" onClick={() => copyRecipe(item.id)}>
                            <Copy width="20" height="20" />
                          </Button>
                        }
                      >
                        <Button default classList="px-2 py-1" onClick={() => removeRecipe(item)}>
                          <Trash width="20" height="20" />
                        </Button>
                      </Show>
                    </div>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </Show>
      <Modal>
        <p class="mb-2 text-xl">{TRANSLATION[locale()].newItemTitle}</p>
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].tool}
          items={Object.fromEntries(tools().map(({ id, name }) => [id, name[locale()]]))}
          selectedValue={recipeForm.tool_id}
          onSelect={(value) => setRecipeForm({ ...recipeForm, tool_id: value })}
        />
        <Select
          relative
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].item}
          items={Object.fromEntries(items().map(({ id, name }) => [id, name[locale()]]))}
          selectedValue={recipeForm.item_id}
          onSelect={(value) => setRecipeForm({ ...recipeForm, item_id: value })}
        />
        <Checkbox
          labelText={TRANSLATION[locale()].public}
          labelPosition="right"
          labelClassList="ml-2"
          checked={recipeForm.public}
          classList="mb-2"
          onToggle={() => setRecipeForm({ ...recipeForm, public: !recipeForm.public })}
        />
        <Button default classList="px-2 py-1" onClick={createRecipe}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}
