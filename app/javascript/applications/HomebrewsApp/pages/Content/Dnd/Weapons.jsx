import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox, DndItemBonuses, DndBonuses } from '../../../components';
import { Edit, Trash, Copy } from '../../../assets';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createItemRequest } from '../../../requests/createItemRequest';
import { changeItemRequest } from '../../../requests/changeItemRequest';
import { removeItemRequest } from '../../../requests/removeItemRequest';
import { copyItemRequest } from '../../../requests/copyItemRequest';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    add: 'Add weapon',
    newItemTitle: 'Weapon form',
    name: 'Weapon name',
    weaponSkill: 'Category',
    damageType: 'Damage type',
    damage: 'Damage',
    mastery: 'Mastery',
    type: 'Type',
    range: 'Range',
    features: 'Features',
    description: 'Description',
    save: 'Save',
    requiredName: 'Name is required',
    requiredDamage: 'Damage is required',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Weapon copy is completed',
    skills: {
      light: 'Light',
      martial: 'Martial'
    },
    damageTypes: {
      bludge: 'Bludgeoning',
      pierce: 'Piercing',
      slash: 'Slashing'
    },
    types: {
      melee: 'Melee',
      range: 'Range',
      thrown: 'Thrown'
    },
    featuresList: {
      finesse: 'Finesse',
      reload: 'Reload',
      '2handed': 'Two Handed',
      heavy: 'Heavy',
      light: 'Light',
      versatile: 'Versatile',
      reach: 'Reach'
    },
    weight: 'Weight',
    price: 'Price, cc'
  },
  ru: {
    add: 'Добавить оружие',
    newItemTitle: 'Редактирование оружия',
    name: 'Название оружия',
    weaponSkill: 'Категория',
    damageType: 'Тип урона',
    damage: 'Урон',
    mastery: 'Приём',
    type: 'Тип',
    range: 'Дальность',
    features: 'Свойства',
    description: 'Описание',
    save: 'Сохранить',
    requiredName: 'Название оружия - обязательное поле',
    requiredDamage: 'Урон оружия - обязательное поле',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступная',
    copyCompleted: 'Копирование оружия завершено',
    skills: {
      light: 'Простое',
      martial: 'Воинское'
    },
    damageTypes: {
      bludge: 'Дробящий',
      pierce: 'Колющий',
      slash: 'Рубящий'
    },
    types: {
      melee: 'Рукопашное',
      range: 'Дальнобойное',
      thrown: 'Метательное'
    },
    featuresList: {
      finesse: 'Фехтовальное',
      reload: 'Перезарядка',
      '2handed': 'Двуручное',
      heavy: 'Тяжёлое',
      light: 'Лёгкое',
      versatile: 'Универсальное',
      reach: 'Досягаемость'
    },
    weight: 'Вес',
    price: 'Цена, медяки'
  }
}

export const DndWeapons = () => {
  const [itemForm, setItemForm] = createStore({
    name: '',
    kind: 'weapon',
    weapon_skill: 'light',
    damage_type: 'bludge',
    damage: 'd6',
    type: 'melee',
    range: null,
    description: '',
    mastery: null,
    caption: [],
    public: false,
    own: true,
    weight: 1,
    price: 100
  });
  const [itemBonuses, setItemBonuses] = createSignal([]);
  const [bonuses, setBonuses] = createSignal([]);

  const [items, setItems] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlert, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'dnd', 'weapon');

    Promise.all([fetchItems()]).then(
      ([itemsDate]) => {
        setItems(itemsDate.items);
      }
    );
  });

  const selectFeature = (value) => {
    if (itemForm.caption.includes(value)) setItemForm({ ...itemForm, caption: itemForm.caption.filter((item) => item !== value) });
    else setItemForm({ ...itemForm, caption: itemForm.caption.concat([value]) });
  }

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
        description: item.description.en,
        kind: item.kind,
        weapon_skill: item.info.weapon_skill,
        damage_type: item.info.damage_type,
        damage: item.info.damage,
        mastery: item.info.mastery,
        type: item.info.type,
        range: item.info.range,
        caption: Object.keys(item.info.caption),
        public: item.public,
        own: true,
        weight: item.data.weight,
        price: item.data.price
      });
      setItemBonuses(item.bonuses);
      openModal();
    });
  }

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);
    if (itemForm.damage.length === 0) return renderAlert(TRANSLATION[locale()].requiredDamage);

    const formData = {
      name: itemForm.name,
      description: itemForm.description,
      kind: itemForm.kind,
      public: itemForm.data,
      info: {
        weapon_skill: itemForm.weapon_skill,
        damage_type: itemForm.damage_type,
        damage: itemForm.damage,
        mastery: itemForm.mastery,
        type: itemForm.type,
        range: itemForm.range,
        caption: itemForm.caption.reduce((acc, item) => { acc[item] = true; return acc }, {})
      },
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
        setItemForm({ ...itemForm, id: null });
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
          ...formData,
          name: { en: itemForm.name, ru: itemForm.name },
          description: { en: itemForm.description, ru: itemForm.description },
          data: { weight: itemForm.weight, price: itemForm.price },
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
    const result = await removeItemRequest(appState.accessToken, 'dnd', item.id);

    if (result.errors_list === undefined) {
      setItems(items().filter(({ id }) => id !== item.id ));
    }
  }

  const copyItem = async (itemId) => {
    const result = await copyItemRequest(appState.accessToken, 'dnd', itemId);
    if (result.errors_list === undefined) {
      setItems([result.item].concat(items()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
    }
  }

  return (
    <Show when={items() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredItems().length > 0}>
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].weaponSkill}</td>
              <td class="p-1">{TRANSLATION[locale()].type}</td>
              <td class="p-1 text-nowrap">{TRANSLATION[locale()].damageType}</td>
              <td class="p-1">{TRANSLATION[locale()].damage}</td>
              <td class="p-1">{TRANSLATION[locale()].mastery}</td>
              <td class="p-1">{TRANSLATION[locale()].range}</td>
              <td class="p-1">{TRANSLATION[locale()].features}</td>
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={filteredItems()}>
              {(item) =>
                <tr>
                  <td class="minimum-width py-1">{item.name[locale()]}</td>
                  <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].skills[item.info.weapon_skill]}</td>
                  <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].types[item.info.type]}</td>
                  <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].damageTypes[item.info.damage_type]}</td>
                  <td class="minimum-width py-1 text-sm">{item.info.damage}</td>
                  <td class="minimum-width py-1 text-sm">
                    {item.info.mastery ? config.weaponMasteries[item.info.mastery].name[locale()] : ''}
                  </td>
                  <td class="minimum-width py-1 text-sm">{item.info.range}</td>
                  <td class="minimum-width py-1 text-sm">
                    <div class="flex gap-1">
                      <For each={Object.keys(item.info.caption)}>
                        {(feature) =>
                          <p class="p-1 bg-neutral-200 rounded">{TRANSLATION[locale()].featuresList[feature]}</p>
                        }
                      </For>
                    </div>
                  </td>
                  <td class="minimum-width py-1"><DndBonuses bonuses={item.bonuses} /></td>
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
        <p class="text-xl">{TRANSLATION[locale()].newItemTitle}</p>
        <Input
          containerClassList="form-field mt-2 mb-4"
          labelText={TRANSLATION[locale()].name}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].weaponSkill}
            items={TRANSLATION[locale()].skills}
            selectedValue={itemForm.weapon_skill}
            onSelect={(value) => setItemForm({ ...itemForm, weapon_skill: value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].damageType}
            items={TRANSLATION[locale()].damageTypes}
            selectedValue={itemForm.damage_type}
            onSelect={(value) => setItemForm({ ...itemForm, damage_type: value })}
          />
          <Input
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].damage}
            value={itemForm.damage}
            onInput={(value) => setItemForm({ ...itemForm, damage: value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].mastery}
            items={translate(config.weaponMasteries, locale())}
            selectedValue={itemForm.mastery}
            onSelect={(value) => setItemForm({ ...itemForm, mastery: value })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].type}
            items={TRANSLATION[locale()].types}
            selectedValue={itemForm.type}
            onSelect={(value) => setItemForm({ ...itemForm, type: value })}
          />
          <Show when={itemForm.type === 'thrown' || itemForm.type === 'range'}>
            <Input
              containerClassList="flex-1"
              labelText={TRANSLATION[locale()].range}
              placeholder="30/180"
              value={itemForm.range}
              onInput={(value) => setItemForm({ ...itemForm, range: value })}
            />
          </Show>
          <Select
            multi
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].features}
            items={TRANSLATION[locale()].featuresList}
            selectedValues={itemForm.caption}
            onSelect={selectFeature}
          />
        </div>
        <DndItemBonuses bonuses={itemBonuses()} onBonus={setBonuses} />
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
