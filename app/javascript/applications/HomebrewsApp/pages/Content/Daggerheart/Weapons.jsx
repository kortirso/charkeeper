import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchHomebrewsList } from '../../../requests/fetchHomebrewsList';
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
    add: 'Add weapon',
    newItemTitle: 'Weapon form',
    name: 'Weapon name',
    tier: 'Tier',
    trait: 'Trait',
    damageType: 'Damage type',
    burden: 'Burden',
    range: 'Range',
    damage: 'Damage',
    damageBonus: 'Damage bonus',
    features: 'Features',
    description: 'Description',
    kind: 'Kind',
    save: 'Save',
    requiredName: 'Name is required',
    requiredDamage: 'Damage is required',
    requiredItemable: 'Set attachable object',
    itemOrigin: 'Attach item to',
    itemOriginValue: 'Attachable object',
    kinds: {
      'primary weapon': 'Primary',
      'secondary weapon': 'Secondary'
    }
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить оружие',
    newItemTitle: 'Редактирование оружия',
    name: 'Название оружия',
    tier: 'Ранг',
    trait: 'Характеристика',
    damageType: 'Тип урона',
    burden: 'Хват',
    range: 'Дальность',
    damage: 'Урон',
    damageBonus: 'Бонус урона',
    features: 'Особенности',
    description: 'Описание',
    kind: 'Тип оружия',
    save: 'Сохранить',
    requiredName: 'Название оружия - обязательное поле',
    requiredDamage: 'Урон оружия - обязательное поле',
    requiredItemable: 'Укажите принадлежность',
    itemOrigin: 'Принадлежность',
    itemOriginValue: 'Объект принадлежности',
    kinds: {
      'primary weapon': 'Основное',
      'secondary weapon': 'Запасное'
    }
  }
}

export const DaggerheartWeapons = () => {
  const [itemForm, setItemForm] = createStore({
    name: '',
    kind: 'primary weapon',
    burden: 1,
    tier: 1,
    trait: 'str',
    range: 'melee',
    damage_type: 'physical',
    damage: 'd6',
    damage_bonus: 0,
    features: '',
    itemable_type: null,
    itemable_id: null,
    description: ''
  });
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchHomebrews = async () => await fetchHomebrewsList(appState.accessToken, 'daggerheart');
    const fetchItems = async () => await fetchDaggerheartItems(appState.accessToken, 'primary weapon,secondary weapon');

    Promise.all([fetchItems(), fetchHomebrews(), fetchBooks()]).then(
      ([itemsDate, homebrewsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setItems(itemsDate.items);
          setHomebrews(homebrewsData);
        });
      }
    );
  });

  const traitsForSelect = createMemo(() => {
    return { ...{ 'null': 'No value' }, ...translate(config.traits, locale()) };
  });

  const openCreateItemModal = () => {
    batch(() => {
      setItemForm({ ...itemForm, id: null });
      openModal();
    });
  }

  const openChangeItemModal = (item) => {
    batch(() => {
      setItemForm({
        id: item.id,
        name: item.name.en,
        kind: item.kind,
        burden: item.info.burden,
        tier: item.info.tier,
        trait: item.info.trait,
        range: item.info.range,
        damage_type: item.info.damage_type,
        damage: item.info.damage,
        damage_bonus: item.info.damage_bonus,
        features: item.info.features[0] ? item.info.features[0].en : '',
        itemable_type: null,
        itemable_id: null,
        description: item.description.en
      });
      openModal();
    });
  }

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);
    if (itemForm.damage.length === 0) return renderAlert(TRANSLATION[locale()].requiredDamage);
    if (itemForm.itemable_type && !itemForm.itemable_id) return renderAlert(TRANSLATION[locale()].requiredItemable);
    if (!itemForm.itemable_type && itemForm.itemable_id) return renderAlert(TRANSLATION[locale()].requiredItemable);

    const formData = {
      name: itemForm.name,
      description: itemForm.description,
      kind: itemForm.kind,
      itemable_type: itemForm.itemable_type,
      itemable_id: itemForm.itemable_id,
      info: {
        burden: itemForm.burden,
        tier: itemForm.tier,
        trait: itemForm.trait,
        range: itemForm.range,
        damage_type: itemForm.damage_type,
        damage: itemForm.damage,
        damage_bonus: !isNaN(itemForm.damage_bonus) ? (parseInt(itemForm.damage_bonus) || 0) : 0,
        features: [{ en: itemForm.features, ru: itemForm.features }]
      }
    }

    itemForm.id === null ? createItem(formData) : updateItem(formData);
  }

  const createItem = async (formData) => {
    const result = await createDaggerheartItem(appState.accessToken, { brewery: formData });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ ...itemForm, id: null });
        closeModal();
      });
    }
  }

  const updateItem = async (formData) => {
    const result = await changeDaggerheartItem(appState.accessToken, itemForm.id, { brewery: formData, only_head: true });

    if (result.errors_list === undefined) {
      const newItems = items().map((item) => {
        if (itemForm.id !== item.id) return item;

        return {
          ...formData,
          name: { en: itemForm.name, ru: itemForm.name },
          description: { en: itemForm.description, ru: itemForm.description },
          features: { en: itemForm.features, ru: itemForm.features }
        };
      });

      batch(() => {
        setItems(newItems);
        setItemForm({ ...itemForm, id: null });
        closeModal();
      });
    }
  }

  const removeItem = async (item) => {
    const result = await removeDaggerheartItem(appState.accessToken, item.id);

    if (result.errors_list === undefined) {
      setItems(items().filter(({ id }) => id !== item.id ));
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
              <td class="p-1">{TRANSLATION[locale()].kind}</td>
              <td class="p-1">{TRANSLATION[locale()].tier}</td>
              <td class="p-1">{TRANSLATION[locale()].trait}</td>
              <td class="p-1">{TRANSLATION[locale()].range}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].damageType}</td>
              <td class="p-1">{TRANSLATION[locale()].damage}</td>
              <td class="p-1">{TRANSLATION[locale()].burden}</td>
              <td class="p-1" />
              <td class="p-1" />
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
                  <td class="minimum-width py-1 text-sm">{item.info.tier}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.trait ? config.traits[item.info.trait].name[locale()] : ''}</td>
                  <td class="minimum-width py-1 text-sm">{config.ranges[item.info.range].name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">{config.damageTypes[item.info.damage_type].name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">
                    {item.info.damage}
                    <Show when={item.info.damage_bonus !== 0}>
                      +{item.info.damageBonus}
                    </Show>
                  </td>
                  <td class="minimum-width py-1 text-sm">{item.info.burden}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.features.en}</td>
                  <td class="py-1">{item.description[locale()]}</td>
                  <td>
                    <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                      <Button default classList="px-2 py-1" onClick={() => openChangeItemModal(item)}>
                        <Edit width="20" height="20" />
                      </Button>
                      <Button default classList="px-2 py-1" onClick={() => removeItem(item)}>
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
        <Input
          containerClassList="form-field mb-4"
          labelText={TRANSLATION[locale()].name}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].kind}
          items={translate({ "primary weapon": { "name": { "en": "Primary Weapon", "ru": "Основное оружие" } }, "secondary weapon": { "name": { "en": "Secondary Weapon", "ru": "Запасное оружие" } } }, locale())}
          selectedValue={itemForm.kind}
          onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
        />
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].tier}
            items={{ 1: 1, 2: 2, 3: 3, 4: 4 }}
            selectedValue={itemForm.tier}
            onSelect={(value) => setItemForm({ ...itemForm, tier: parseInt(value) })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].trait}
            items={traitsForSelect()}
            selectedValue={itemForm.trait}
            onSelect={(value) => setItemForm({ ...itemForm, trait: value === 'null' ? null : value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].damageType}
            items={translate(config.damageTypes, locale())}
            selectedValue={itemForm.damage_type}
            onSelect={(value) => setItemForm({ ...itemForm, damage_type: value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].burden}
            items={{ 1: 1, 2: 2 }}
            selectedValue={itemForm.burden}
            onSelect={(value) => setItemForm({ ...itemForm, burden: parseInt(value) })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].range}
            items={translate(config.ranges, locale())}
            selectedValue={itemForm.range}
            onSelect={(value) => setItemForm({ ...itemForm, range: value })}
          />
          <Input
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].damage}
            value={itemForm.damage}
            onInput={(value) => setItemForm({ ...itemForm, damage: value })}
          />
          <Input
            numeric
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].damageBonus}
            value={itemForm.damage_bonus}
            onInput={(value) => setItemForm({ ...itemForm, damage_bonus: parseInt(value) })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].itemOrigin}
            items={{ 'null': 'No value', 'Feat': 'Feat' }}
            selectedValue={itemForm.itemable_type}
            onSelect={(value) => setItemForm({ ...itemForm, itemable_type: value === 'null' ? null : value })}
          />
          <Select
            disabled={itemForm.itemable_type === null}
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].itemOriginValue}
            items={homebrews().feats.reduce((acc, item) => { acc[item.id] = item.title['en']; return acc; }, {})}
            selectedValue={itemForm.itemable_id}
            onSelect={(value) => setItemForm({ ...itemForm, itemable_id: value })}
          />
        </div>
        <TextArea
          rows="3"
          labelText={TRANSLATION[locale()].features}
          value={itemForm.features}
          onChange={(value) => setItemForm({ ...itemForm, features: value })}
        />
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
