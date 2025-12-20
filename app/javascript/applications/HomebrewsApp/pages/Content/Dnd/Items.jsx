import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox, DndItemBonuses, DndBonuses } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createItemRequest } from '../../../requests/createItemRequest';
import { changeItemRequest } from '../../../requests/changeItemRequest';
import { removeItemRequest } from '../../../requests/removeItemRequest';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add item',
    newItemTitle: 'Item form',
    name: 'Item name',
    description: 'Description',
    kind: 'Kind',
    kindTable: 'Kind',
    save: 'Save',
    requiredName: 'Name is required',
    weight: 'Weight',
    price: 'Price, cc',
    kinds: {
      item: 'Item',
      potion: 'Potion',
      tools: 'Tools',
      music: 'Music tools',
      focus: 'Focus',
      ammo: 'Ammo'
    },
    convert: 'Convert'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить предмет',
    newItemTitle: 'Редактирование предмета',
    name: 'Название предмета',
    description: 'Описание',
    kind: 'Тип предмета',
    kindTable: 'Тип',
    save: 'Сохранить',
    requiredName: 'Название предмета - обязательное поле',
    weight: 'Вес',
    price: 'Цена, медяки',
    kinds: {
      item: 'Предмет',
      potion: 'Зелье',
      tools: 'Инструмент',
      music: 'Музыкальный инструмент',
      focus: 'Фокус',
      ammo: 'Боеприпас'
    },
    convert: 'Конвертировать'
  }
}

export const DndItems = () => {
  const [itemForm, setItemForm] = createStore({ name: '', description: '', kind: 'item', weight: 1, price: 1 });
  const [itemBonuses, setItemBonuses] = createSignal([]);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);
  const [bonuses, setBonuses] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'dnd', 'item,potion,tools,music,focus,ammo');

    Promise.all([fetchItems(), fetchBooks()]).then(
      ([itemsDate, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setItems(itemsDate.items);
        });
      }
    );
  });

  const openCreateItemModal = () => {
    batch(() => {
      setItemForm({ id: null, name: '', description: '', kind: 'item' });
      setItemBonuses([]);
      openModal();
    });
  }

  const openChangeItemModal = (item) => {
    batch(() => {
      setItemForm({ id: item.id, name: item.name.en, description: item.description.en, weight: item.data.weight, price: item.data.price });
      setItemBonuses(item.bonuses);
      openModal();
    });
  }

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);

    const formData = {
      name: itemForm.name,
      description: itemForm.description,
      kind: itemForm.kind,
      data: {
        weight: itemForm.weight,
        price: itemForm.price
      }
    }

    itemForm.id === null ? createItem(formData) : updateItem(formData);
  }

  const createItem = async (formData) => {
    const result = await createItemRequest(appState.accessToken, 'dnd', { brewery: formData, bonuses: bonuses() });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ id: null, name: '', description: '', kind: 'item' });
        setItemBonuses([]);
        closeModal();
      });
    }
  }

  const updateItem = async (formData) => {
    const result = await changeItemRequest(appState.accessToken, 'dnd', itemForm.id, { brewery: formData, bonuses: bonuses(), only_head: true });

    if (result.errors_list === undefined) {
      const newItems = items().map((item) => {
        if (itemForm.id !== item.id) return item;

        return {
          ...item,
          name: { en: formData.name, ru: formData.name },
          description: { en: formData.description, ru: formData.description },
          bonuses: bonuses()
        };
      });

      batch(() => {
        setItems(newItems);
        setItemForm({ id: null, name: '', description: '', kind: 'item' });
        setItemBonuses([]);
        closeModal();
      });
    }
  }

  const removeItem = async (itemId) => {
    const result = await removeItemRequest(appState.accessToken, 'dnd', itemId);

    if (result.errors_list === undefined) {
      setItems(items().filter(({ id }) => id !== itemId ));
    }
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'item');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={items() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={items().length > 0}>
        <div class="flex items-center">
          <Select
            containerClassList="w-40"
            labelText={TRANSLATION[locale()].selectBook}
            items={Object.fromEntries(books().filter(({ shared }) => shared === null).map((item) => [item.id, item.name]))}
            selectedValue={book()}
            onSelect={setBook}
          />
          <Show when={book() && selectedIds().length > 0}>
            <Button default classList="px-2 py-1 mt-6 ml-4" onClick={addToBook}>
              {TRANSLATION[locale()].save}
            </Button>
          </Show>
        </div>
        <p class="text-sm mt-1 mb-2">{TRANSLATION[locale()].selectBookHelp}</p>
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].kindTable}</td>
              <td class="p-1">{TRANSLATION[locale()].weight}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].price}</td>
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].description}</td>
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={items()}>
              {(item) =>
                <tr>
                  <td class="minimum-width py-1">
                    <Checkbox
                      checked={selectedIds().includes(item.id)}
                      classList="mr-1"
                      innerClassList="small"
                      onToggle={() => selectedIds().includes(item.id) ? setSelectedIds(selectedIds().filter((id) => id !== item.id)) : setSelectedIds(selectedIds().concat(item.id))}
                    />
                  </td>
                  <td class="minimum-width py-1">{item.name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].kinds[item.kind]}</td>
                  <td class="minimum-width py-1">{item.data.weight}</td>
                  <td class="minimum-width py-1">{item.data.price}</td>
                  <td class="minimum-width py-1"><DndBonuses bonuses={item.bonuses} /></td>
                  <td class="py-1">{item.description[locale()]}</td>
                  <td>
                    <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                      <Button default classList="px-2 py-1" onClick={() => openChangeItemModal(item)}>
                        <Edit width="20" height="20" />
                      </Button>
                      <Button default classList="px-2 py-1" onClick={() => removeItem(item.id)}>
                        <Trash width="20" height="20" />
                      </Button>
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
        {/*<Show when={itemForm.id}>
          <Select
            containerClassList="mb-2"
            labelText={TRANSLATION[locale()].convert}
            items={translate({ "primary weapon": { "name": { "en": "Primary Weapon", "ru": "Основное оружие" } }, "secondary weapon": { "name": { "en": "Secondary Weapon", "ru": "Запасное оружие" } }, "armor": { "name": { "en": "Armor", "ru": "Броня" } } }, locale())}
            selectedValue={itemForm.convert}
            onSelect={(value) => setItemForm({ ...itemForm, convert: value })}
          />
        </Show>*/}
        <Input
          containerClassList="form-field mb-2"
          labelText={TRANSLATION[locale()].name}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <Show when={!itemForm.id}>
          <Select
            containerClassList="mb-2"
            labelText={TRANSLATION[locale()].kind}
            items={TRANSLATION[locale()].kinds}
            selectedValue={itemForm.kind}
            onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
          />
        </Show>
        <DndItemBonuses bonuses={itemBonuses()} onBonus={setBonuses} />
        <div class="mb-2 flex gap-4">
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].weight}
            value={itemForm.weight}
            onInput={(value) => setItemForm({ ...itemForm, weight: parseFloat(value) })}
          />
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].price}
            value={itemForm.price}
            onInput={(value) => setItemForm({ ...itemForm, price: parseInt(value) })}
          />
        </div>
        <TextArea
          rows="5"
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].description}
          value={itemForm.description}
          onChange={(value) => setItemForm({ ...itemForm, description: value })}
        />
        <Button default classList="px-2 py-1" onClick={saveItem}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}
