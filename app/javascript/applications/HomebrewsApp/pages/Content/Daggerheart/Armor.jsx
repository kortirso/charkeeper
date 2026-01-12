import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox, ItemBonuses, Bonuses } from '../../../components';
import { Edit, Trash, Copy } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createItemRequest } from '../../../requests/createItemRequest';
import { changeItemRequest } from '../../../requests/changeItemRequest';
import { removeItemRequest } from '../../../requests/removeItemRequest';
import { fetchItemRequest } from '../../../requests/fetchItemRequest';
import { copyItemRequest } from '../../../requests/copyItemRequest';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add armor',
    newItemTitle: 'Armor form',
    name: 'Armor name',
    tier: 'Tier',
    baseScore: 'Base score',
    features: 'Features',
    description: 'Description',
    save: 'Save',
    requiredName: 'Name is required',
    thresholds: 'Damage thresholds',
    major: 'Major threshold',
    severe: 'Severe threshold',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Armor copy is completed'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить броню',
    newItemTitle: 'Редактирование брони',
    name: 'Название брони',
    tier: 'Ранг',
    baseScore: 'Очки доспеха',
    features: 'Особенности',
    description: 'Описание',
    save: 'Сохранить',
    requiredName: 'Название брони - обязательное поле',
    itemOrigin: 'Принадлежность',
    itemOriginValue: 'Объект принадлежности',
    thresholds: 'Пороги урона',
    major: 'Ощутимый урон',
    severe: 'Тяжёлый урон',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступная',
    copyCompleted: 'Копирование доспеха завершено'
  }
}

export const DaggerheartArmor = () => {
  const [itemForm, setItemForm] = createStore({
    name: '',
    kind: 'armor',
    tier: 1,
    base_score: 1,
    features: '',
    description: '',
    major: 0,
    severe: 0,
    bonuses: [],
    public: false
  });
  const [itemBonuses, setItemBonuses] = createSignal([]);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);
  const [bonuses, setBonuses] = createSignal([]);

  const [books, setBooks] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlert, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'armor');

    Promise.all([fetchItems(), fetchBooks()]).then(
      ([itemsDate, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.own));
          setItems(itemsDate.items);
        });
      }
    );
  });

  const filteredItems = createMemo(() => {
    if (items() === undefined) return [];

    return items().filter(({ own }) => open() ? !own : own);
  });

  const openCreateItemModal = () => {
    batch(() => {
      setItemForm({ ...itemForm, id: null });
      setItemBonuses([]);
      openModal();
    });
  }

  const openChangeItemModal = (item) => {
    batch(() => {
      setItemForm({
        id: item.id,
        name: item.name.en,
        kind: 'armor',
        tier: item.info.tier,
        base_score: item.info.base_score,
        major: item.info.bonuses.thresholds.major,
        severe: item.info.bonuses.thresholds.severe,
        features: item.info.features[0] ? item.info.features[0].en : '',
        description: item.description.en,
        public: item.public
      });
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
      info: {
        tier: itemForm.tier,
        base_score: itemForm.base_score,
        bonuses: { thresholds: { major: itemForm.major, severe: itemForm.severe } },
        features: [{ en: itemForm.features, ru: itemForm.features }]
      },
      public: itemForm.public
    }

    itemForm.id === null ? createItem(formData) : updateItem(formData);
  }

  const createItem = async (formData) => {
    const result = await createItemRequest(appState.accessToken, 'daggerheart', { brewery: formData, bonuses: bonuses() });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ ...itemForm, id: null });
        setItemBonuses([]);
        closeModal();
      });
    }
  }

  const updateItem = async (formData) => {
    const result = await changeItemRequest(appState.accessToken, 'daggerheart', itemForm.id, { brewery: formData, bonuses: bonuses(), only_head: true });

    if (result.errors_list === undefined) {
      const newItems = items().map((item) => {
        if (itemForm.id !== item.id) return item;

        return {
          ...formData,
          name: { en: itemForm.name, ru: itemForm.name },
          description: { en: itemForm.description, ru: itemForm.description },
          features: { en: itemForm.features, ru: itemForm.features },
          own: true,
          public: itemForm.public,
          bonuses: bonuses()
        };
      });

      batch(() => {
        setItems(newItems);
        setItemForm({ ...itemForm, id: null });
        setItemBonuses([]);
        closeModal();
      });
    }
  }

  const removeItem = async (item) => {
    const result = await removeItemRequest(appState.accessToken, 'daggerheart', item.id);

    if (result.errors_list === undefined) {
      setItems(items().filter(({ id }) => id !== item.id ));
    }
  }

  const copyItem = async (itemId) => {
    const result = await copyItemRequest(appState.accessToken, 'daggerheart', itemId);
    const item = await fetchItemRequest(appState.accessToken, 'daggerheart', result.item.id)
    if (item.errors_list === undefined) {
      setItems([item.item].concat(items()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
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
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredItems().length > 0}>
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
              <td class="p-1">{TRANSLATION[locale()].tier}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].baseScore}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].thresholds}</td>
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={filteredItems()}>
              {(item) =>
                <tr>
                  <td class="minimum-width py-1">
                    <Show when={!open()}>
                      <Checkbox
                        checked={selectedIds().includes(item.id)}
                        classList="mr-1"
                        innerClassList="small"
                        onToggle={() => selectedIds().includes(item.id) ? setSelectedIds(selectedIds().filter((id) => id !== item.id)) : setSelectedIds(selectedIds().concat(item.id))}
                      />
                    </Show>
                  </td>
                  <td class="minimum-width py-1">{item.name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.tier}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.base_score}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.bonuses.thresholds.major}/{item.info.bonuses.thresholds.severe}</td>
                  <td class="minimum-width py-1"><Bonuses bonuses={item.bonuses} /></td>
                  <td class="minimum-width py-1 text-sm">{item.info.features[0] ? item.info.features[0].en : ''}</td>
                  <td class="py-1">{item.description[locale()]}</td>
                  <td>
                    <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                      <Show
                        when={!open()}
                        fallback={
                          <Button default classList="px-2 py-1" onClick={() => copyItem(item.id)}>
                            <Copy width="20" height="20" />
                          </Button>
                        }
                      >
                        <Button default classList="px-2 py-1" onClick={() => openChangeItemModal(item)}>
                          <Edit width="20" height="20" />
                        </Button>
                        <Button default classList="px-2 py-1" onClick={() => removeItem(item)}>
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
        <Input
          containerClassList="form-field mb-4"
          labelText={TRANSLATION[locale()].name}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].tier}
            items={{ 1: 1, 2: 2, 3: 3, 4: 4 }}
            selectedValue={itemForm.tier}
            onSelect={(value) => setItemForm({ ...itemForm, tier: parseInt(value) })}
          />
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].baseScore}
            value={itemForm.base_score}
            onInput={(value) => setItemForm({ ...itemForm, base_score: parseInt(value) })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].major}
            value={itemForm.major}
            onInput={(value) => setItemForm({ ...itemForm, major: parseInt(value) })}
          />
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].severe}
            value={itemForm.severe}
            onInput={(value) => setItemForm({ ...itemForm, severe: parseInt(value) })}
          />
        </div>
        <TextArea
          rows="3"
          labelText={TRANSLATION[locale()].features}
          value={itemForm.features}
          onChange={(value) => setItemForm({ ...itemForm, features: value })}
        />
        <ItemBonuses bonuses={itemBonuses()} onBonus={setBonuses} />
        <TextArea
          rows="5"
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].description}
          value={itemForm.description}
          onChange={(value) => setItemForm({ ...itemForm, description: value })}
        />
        <Checkbox
          labelText={TRANSLATION[locale()].public}
          labelPosition="right"
          labelClassList="ml-2"
          checked={itemForm.public}
          classList="mb-2"
          onToggle={() => setItemForm({ ...itemForm, public: !itemForm.public })}
        />
        <Button default classList="px-2 py-1" onClick={saveItem}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}
