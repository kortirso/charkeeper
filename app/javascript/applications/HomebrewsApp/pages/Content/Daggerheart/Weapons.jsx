import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchHomebrewsList } from '../../../requests/fetchHomebrewsList';
import { fetchDaggerheartItems } from '../../../requests/fetchDaggerheartItems';
import { createDaggerheartItem } from '../../../requests/createDaggerheartItem';
import { changeDaggerheartItem } from '../../../requests/changeDaggerheartItem';
import { removeDaggerheartItem } from '../../../requests/removeDaggerheartItem';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
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

  const [items, setItems] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchHomebrews = async () => await fetchHomebrewsList(appState.accessToken, 'daggerheart');
    const fetchItems = async () => await fetchDaggerheartItems(appState.accessToken, 'primary weapon,secondary weapon');

    Promise.all([fetchItems(), fetchHomebrews()]).then(
      ([itemsDate, homebrewsData]) => {
        batch(() => {
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

  return (
    <Show when={items() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()].add}</Button>
      <table class="w-full table">
        <tbody>
          <For each={items()}>
            {(item) =>
              <tr>
                <td class="minimum-width py-1">{item.name[locale()]}</td>
                <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].kinds[item.kind]}</td>
                <td class="minimum-width py-1 text-sm">{item.info.tier}</td>
                <td class="minimum-width py-1 text-sm">{item.info.trait ? config.traits[item.info.trait].name[locale()] : ''}</td>
                <td class="minimum-width py-1 text-sm">{config.ranges[item.info.range].name[locale()]}</td>
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
