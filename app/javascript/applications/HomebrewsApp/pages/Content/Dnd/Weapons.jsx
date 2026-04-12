import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox, ModifiersForm } from '../../../components';
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
    public: 'Общедоступное',
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
  },
  es: {
      add: 'Agregar arma',
      newItemTitle: 'Forma de arma',
      name: 'Nombre del arma',
      weaponSkill: 'Categoría',
      damageType: 'Tipo de daño',
      damage: 'Daño',
      mastery: 'Maestría',
      type: 'Tipo',
      range: 'Alcance',
      features: 'Características',
      description: 'Descripción',
      save: 'Guardar',
      requiredName: 'El nombre del arma es obligatorio',
      requiredDamage: 'El daño del arma es obligatorio',
      showPublic: 'Mostrar públicas',
      public: 'Público',
      copyCompleted: 'La copia del arma se ha completado',
      skills: {
        light: 'Ligera',
        martial: 'Marcial'
      },
      damageTypes: {
        bludge: 'Contundente',
        pierce: 'Perforante',
        slash: 'Cortante'
      },
      types: {
        melee: 'Cuerpo a cuerpo',
        range: 'A distancia',
        thrown: 'Lanzable'
      },
      featuresList: {
        finesse: 'Fineza',
        reload: 'Recarga',
        '2handed': 'a dos manos',
        heavy: 'Pesado',
        light: 'Ligera',
        versatile: 'Versátil',
        reach: 'Alcance'
      },
      weight: 'Peso',
      price: 'Precio, monedas de cobre'
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
    price: 100,
    modifiers: {}
  });
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
      openModal();
    });
  }

  const changeModifiers = (payload) => setItemForm({ ...itemForm, modifiers: payload });

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
        price: item.data.price,
        modifiers: item.modifiers
      });
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
      },
      modifiers: itemForm.modifiers
    }

    itemForm.id === null ? createItem(formData) : updateItem(formData);
  }

  const createItem = async (formData) => {
    const result = await createItemRequest(appState.accessToken, 'dnd', { brewery: formData });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ ...itemForm, id: null });
        closeModal();
      });
    }
  }

  const updateItem = async (formData) => {
    const result = await changeItemRequest(appState.accessToken, 'dnd', itemForm.id, { brewery: formData, only_head: true });

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
          modifiers: itemForm.modifiers
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
        <ModifiersForm
          modifiers={itemForm.modifiers}
          mapping={MAPPING[locale()]}
          onlyAdd={ONLY_ADD}
          variables={VARIABLES[locale()]}
          onChange={changeModifiers}
        />
        <TextArea
          rows="5"
          containerClassList="my-4"
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
