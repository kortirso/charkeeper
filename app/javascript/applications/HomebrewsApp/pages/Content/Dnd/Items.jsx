import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Key } from '@solid-primitives/keyed';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import {
  Button, Input, TextArea, Select, createModal, ModifiersForm
} from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createItemRequest } from '../../../requests/createItemRequest';
import { changeItemRequest } from '../../../requests/changeItemRequest';
import { removeItemRequest } from '../../../requests/removeItemRequest';
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
    convert: 'Convert',
    addConsume: 'Add consume effect',
    consumeAttribute: 'Changing attribute',
    consumeFormula: 'Formula',
    formulas1: 'Formula can contain math expressions.',
    formulas2: 'For dice rolls use D(x), where x - dices amount.',
    formulas3: "For example, 'D(4)+2', '-1 * 2 * D(4) + 3'."
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
    convert: 'Конвертировать',
    addConsume: 'Добавить эффект использования',
    consumeAttribute: 'Изменяемый атрибут',
    consumeFormula: 'Формула',
    formulas1: 'Формула может содержать математические выражения.',
    formulas2: 'Для броска кубика используёте D(x), где x - кол-во граней.',
    formulas3: "Например, 'D(4)+2', '-1 * 2 * D(4) + 3'."
  }
}

const MAPPING = {
  en: {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'save_dc.str': 'Strength saving throw',
    'save_dc.dex': 'Dexterity saving throw',
    'save_dc.con': 'Constitution saving throw',
    'save_dc.int': 'Intelligence saving throw',
    'save_dc.wis': 'Wisdom saving throw',
    'save_dc.cha': 'Charisma saving throw',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'speeds.swim': 'Swim speed',
    'speeds.flight': 'Flight speed',
    'speeds.climb': 'Climb speed',
    'attack': 'Attack',
    'unarmed_attacks': 'Unarmed attacks',
    'melee_attacks': 'Melee attacks',
    'thrown_attacks': 'Thrown attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'unarmed_damage': 'Unarmed damage',
    'melee_damage': 'Melee damage',
    'thrown_damage': 'Thrown damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'save_dc.str': 'Сила спасбросок',
    'save_dc.dex': 'Ловкость спасбросок',
    'save_dc.con': 'Телосложение спасбросок',
    'save_dc.int': 'Интеллект спасбросок',
    'save_dc.wis': 'Мудрость спасбросок',
    'save_dc.cha': 'Харизма спасбросок',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'speeds.swim': 'Скорость плавания',
    'speeds.flight': 'Скорость полёта',
    'speeds.climb': 'Скорость лазания',
    'attack': 'Атака',
    'unarmed_attacks': 'Безоружные атаки',
    'melee_attacks': 'Рукопашные атаки',
    'thrown_attacks': 'Метательные атаки',
    'range_attacks': 'Дистанционные атаки',
    'damage': 'Урон',
    'unarmed_damage': 'Безоружный урон',
    'melee_damage': 'Рукопашный урон',
    'thrown_damage': 'Метательный урон',
    'range_damage': 'Дистанционный урон'
  }
}

const ONLY_ADD = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'attack', 'damage'];

const VARIABLES = {
  en: {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma',
    level: 'Level',
    proficiency_bonus: 'Proficiency bonus',
    no_body_armor: 'No body armor',
    no_armor: 'No armor'
  },
  ru: {
    str: 'Сила',
    dex: 'Ловкость',
    con: 'Телосложение',
    int: 'Интеллект',
    wis: 'Мудрость',
    cha: 'Харизма',
    level: 'Уровень',
    proficiency_bonus: 'Бонус мастерства',
    no_body_armor: 'Без доспеха',
    no_armor: 'Без брони'
  }
}

export const DndItems = () => {
  const [itemForm, setItemForm] = createStore({ name: '', description: '', kind: 'item', weight: 1, price: 1, modifiers: {} });
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [consume, setConsume] = createSignal([]);

  const [books, setBooks] = createSignal(undefined); // eslint-disable-line no-unused-vars
  const [items, setItems] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'dnd');
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
      setItemForm({ id: null, name: '', description: '', kind: 'item', modifiers: {} });
      setConsume([]);
      openModal();
    });
  }

  const openChangeItemModal = (item) => {
    batch(() => {
      setItemForm({ id: item.id, name: item.name.en, kind: item.kind, description: item.description.en, weight: item.data.weight, price: item.data.price, modifiers: item.modifiers });
      setConsume(item.info.consume || []);
      openModal();
    });
  }

  const addConsume = () => setConsume(consume().concat({ id: Math.floor(Math.random() * 1000), attribute: null, formula: '' }));

  const changeConsume = (id, attribute, value) => {
    const result = consume().map((item) => {
      if (item.id !== id) return item;

      return { ...item, [attribute]: value };
    });
    setConsume(result);
  }

  const changeModifiers = (payload) => setItemForm({ ...itemForm, modifiers: payload });

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);

    const formData = {
      name: itemForm.name,
      description: itemForm.description,
      kind: itemForm.kind,
      data: {
        weight: itemForm.weight,
        price: itemForm.price
      },
      modifiers: itemForm.modifiers
    }

    itemForm.id === null ? createItem(formData) : updateItem(formData);
  }

  const createItem = async (formData) => {
    const result = await createItemRequest(appState.accessToken, 'dnd', { brewery: formData, consume: consume().filter((item) => item.attribute !== null && item.formula.length > 0) });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ id: null, name: '', description: '', kind: 'item', modifiers: {} });
        setConsume([]);
        closeModal();
      });
    }
  }

  const updateItem = async (formData) => {
    const result = await changeItemRequest(appState.accessToken, 'dnd', itemForm.id, { brewery: formData, consume: consume().filter((item) => item.attribute !== null && item.formula.length > 0), only_head: true });

    if (result.errors_list === undefined) {
      const newItems = items().map((item) => {
        if (itemForm.id !== item.id) return item;

        return {
          ...item,
          name: { en: formData.name, ru: formData.name },
          description: { en: formData.description, ru: formData.description },
          data: { weight: formData.weight, price: formData.price },
          modifiers: formData.modifiers,
          info: { consume: consume().filter((item) => item.attribute !== null && item.formula.length > 0) }
        };
      });

      batch(() => {
        setItems(newItems);
        setItemForm({ id: null, name: '', description: '', kind: 'item', modifiers: {} });
        setConsume([]);
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

  /* eslint-disable no-unused-vars */
  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, 'dnd', book(), { ids: selectedIds(), only_head: true }, 'item');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }
  /* eslint-enable no-unused-vars */

  return (
    <Show when={items() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={items().length > 0}>
        {/*<div class="flex items-center">
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
        <p class="text-sm mt-1 mb-2">{TRANSLATION[locale()].selectBookHelp}</p>*/}
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].kindTable}</td>
              <td class="p-1">{TRANSLATION[locale()].weight}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].price}</td>
              <td class="p-1">{TRANSLATION[locale()].description}</td>
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={items()}>
              {(item) =>
                <tr>
                  <td class="minimum-width py-1">
                    {/*<Checkbox
                      checked={selectedIds().includes(item.id)}
                      classList="mr-1"
                      innerClassList="small"
                      onToggle={() => selectedIds().includes(item.id) ? setSelectedIds(selectedIds().filter((id) => id !== item.id)) : setSelectedIds(selectedIds().concat(item.id))}
                    />*/}
                  </td>
                  <td class="minimum-width py-1">{item.name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].kinds[item.kind]}</td>
                  <td class="minimum-width py-1">{item.data.weight}</td>
                  <td class="minimum-width py-1">{item.data.price}</td>
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
        <p class="text-xl">{TRANSLATION[locale()].newItemTitle}</p>
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
          containerClassList="form-field mt-2"
          labelText={TRANSLATION[locale()].name}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <Show when={!itemForm.id}>
          <Select
            containerClassList="mt-2"
            labelText={TRANSLATION[locale()].kind}
            items={TRANSLATION[locale()].kinds}
            selectedValue={itemForm.kind}
            onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
          />
        </Show>
        <ModifiersForm
          modifiers={itemForm.modifiers}
          mapping={MAPPING[locale()]}
          onlyAdd={ONLY_ADD}
          variables={VARIABLES[locale()]}
          onChange={changeModifiers}
        />
        <div class="mt-2 flex gap-4">
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
        <Show when={itemForm.kind === 'potion'}>
          <Button default small classList="p-1 mt-2" onClick={addConsume}>{TRANSLATION[locale()].addConsume}</Button>
          <Show when={consume().length > 0}>
            <p class="text-xs mt-1">{TRANSLATION[locale()].formulas1}</p>
            <p class="text-xs mt-1">{TRANSLATION[locale()].formulas2}</p>
            <p class="text-xs mt-1 mb-4">{TRANSLATION[locale()].formulas3}</p>
          </Show>
          <Key
            each={consume()}
            by={item => item.id}
          >
            {(consumeItem) =>
              <div class="flex items-center gap-2">
                <Select
                  containerClassList="flex-1"
                  labelText={TRANSLATION[locale()].consumeAttribute}
                  items={translate({ "health": { "name": { "en": "Health", "ru": "Здоровье" } } }, locale())}
                  selectedValue={consumeItem().attribute}
                  onSelect={(value) => changeConsume(consumeItem().id, 'attribute', value)}
                />

                <Input
                  containerClassList="form-field flex-1"
                  labelText={TRANSLATION[locale()].consumeFormula}
                  value={consumeItem().formula}
                  onInput={(value) => changeConsume(consumeItem().id, 'formula', value)}
                />
              </div>
            }
          </Key>
        </Show>
        <TextArea
          rows="5"
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].description}
          value={itemForm.description}
          onChange={(value) => setItemForm({ ...itemForm, description: value })}
        />
        <Button default classList="mt-4 px-2 py-1" onClick={saveItem}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}
