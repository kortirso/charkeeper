import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartItems } from '../../../requests/fetchDaggerheartItems';
import { createDaggerheartItem } from '../../../requests/createDaggerheartItem';
import { changeDaggerheartItem } from '../../../requests/changeDaggerheartItem';
import { removeDaggerheartItem } from '../../../requests/removeDaggerheartItem';

const TRANSLATION = {
  en: {
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
    severe: 'Severe threshold'
  },
  ru: {
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
    severe: 'Тяжёлый урон'
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
    severe: 0
  });

  const [items, setItems] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchItems = async () => await fetchDaggerheartItems(appState.accessToken, 'armor');

    Promise.all([fetchItems()]).then(
      ([itemsDate]) => {
        setItems(itemsDate.items);
      }
    );
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
        kind: 'armor',
        tier: item.info.tier,
        base_score: item.info.base_score,
        major: item.info.bonuses.thresholds.major,
        severe: item.info.bonuses.thresholds.severe,
        features: item.info.features[0] ? item.info.features[0].en : '',
        description: item.description.en
      });
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
        <thead>
          <tr class="text-sm">
            <td class="p-1" />
            <td class="p-1">{TRANSLATION[locale()].tier}</td>
            <td class="p-1 text-nowrap">{TRANSLATION[locale()].baseScore}</td>
            <td class="p-1 text-nowrap">{TRANSLATION[locale()].thresholds}</td>
            <td class="p-1" />
            <td class="p-1" />
            <td class="p-1" />
          </tr>
        </thead>
        <tbody>
          <For each={items()}>
            {(item) =>
              <tr>
                <td class="minimum-width py-1">{item.name[locale()]}</td>
                <td class="minimum-width py-1 text-sm">{item.info.tier}</td>
                <td class="minimum-width py-1 text-sm">{item.info.base_score}</td>
                <td class="minimum-width py-1 text-sm">{item.info.bonuses.thresholds.major}/{item.info.bonuses.thresholds.severe}</td>
                <td class="minimum-width py-1 text-sm">{item.info.features[0] ? item.info.features[0].en : ''}</td>
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
