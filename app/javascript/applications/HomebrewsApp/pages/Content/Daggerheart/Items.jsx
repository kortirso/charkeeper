import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox, ItemBonuses, Bonuses } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartItems } from '../../../requests/fetchDaggerheartItems';
import { createDaggerheartItem } from '../../../requests/createDaggerheartItem';
import { changeDaggerheartItem } from '../../../requests/changeDaggerheartItem';
import { removeDaggerheartItem } from '../../../requests/removeDaggerheartItem';
import { translate } from '../../../helpers';

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
    kinds: {
      item: 'Item',
      consumable: 'Consumable'
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
    kinds: {
      item: 'Предмет',
      consumable: 'Расходник'
    },
    convert: 'Конвертировать'
  }
}

export const DaggerheartItems = () => {
  const [itemForm, setItemForm] = createStore({ name: '', description: '', kind: 'item' });
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
    const fetchItems = async () => await fetchDaggerheartItems(appState.accessToken, 'item,consumable');

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
      setItemForm({ id: item.id, name: item.name.en, description: item.description.en });
      setItemBonuses(item.bonuses);
      openModal();
    });
  }

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);

    itemForm.id === null ? createItem() : updateItem();
  }

  const createItem = async () => {
    const result = await createDaggerheartItem(appState.accessToken, { brewery: itemForm, bonuses: bonuses() });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ id: null, name: '', description: '', kind: 'item' });
        setItemBonuses([]);
        closeModal();
      });
    }
  }

  const updateItem = async () => {
    const result = await changeDaggerheartItem(appState.accessToken, itemForm.id, { brewery: itemForm, bonuses: bonuses(), only_head: true });

    if (result.errors_list === undefined) {
      if (itemForm.convert) {
        batch(() => {
          setItems(items().filter(({ id }) => id !== itemForm.id ));
          setItemForm({ id: null, name: '', description: '', kind: 'item' });
          setItemBonuses([]);
          closeModal();
        });
      } else {
        const newItems = items().map((item) => {
          if (itemForm.id !== item.id) return item;

          return {
            ...item,
            name: { en: itemForm.name, ru: itemForm.name },
            description: { en: itemForm.description, ru: itemForm.description },
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
  }

  const removeItem = async (itemId) => {
    const result = await removeDaggerheartItem(appState.accessToken, itemId);

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
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].description}</td>
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
                  <td class="minimum-width py-1"><Bonuses bonuses={item.bonuses} /></td>
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
        <p class="mb-2 text-xl">{TRANSLATION[locale()]['newItemTitle']}</p>
        <Show when={itemForm.id}>
          <Select
            containerClassList="mb-2"
            labelText={TRANSLATION[locale()].convert}
            items={translate({ "primary weapon": { "name": { "en": "Primary Weapon", "ru": "Основное оружие" } }, "secondary weapon": { "name": { "en": "Secondary Weapon", "ru": "Запасное оружие" } }, "armor": { "name": { "en": "Armor", "ru": "Броня" } } }, locale())}
            selectedValue={itemForm.convert}
            onSelect={(value) => setItemForm({ ...itemForm, convert: value })}
          />
        </Show>
        <Input
          containerClassList="form-field mb-2"
          labelText={TRANSLATION[locale()]['name']}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <Show when={!itemForm.id}>
          <Select
            containerClassList="mb-2"
            labelText={TRANSLATION[locale()]['kind']}
            items={translate({ "item": { "name": { "en": "Item", "ru": "Предмет" } }, "consumable": { "name": { "en": "Consumable", "ru": "Расходник" } } }, locale())}
            selectedValue={itemForm.kind}
            onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
          />
        </Show>
        <ItemBonuses bonuses={itemBonuses()} onBonus={setBonuses} />
        <TextArea
          rows="5"
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()]['description']}
          value={itemForm.description}
          onChange={(value) => setItemForm({ ...itemForm, description: value })}
        />
        <Button default classList="px-2 py-1" onClick={saveItem}>
          {TRANSLATION[locale()]['save']}
        </Button>
      </Modal>
    </Show>
  );
}
