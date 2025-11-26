import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal } from '../../../components';
import { Edit, Trash } from '../../../assets';
import { fetchDaggerheartItems } from '../../../requests/fetchDaggerheartItems';
// import { fetchDaggerheartCommunity } from '../../../requests/fetchDaggerheartCommunity';
import { createDaggerheartItem } from '../../../requests/createDaggerheartItem';
import { changeDaggerheartItem } from '../../../requests/changeDaggerheartItem';
import { removeDaggerheartItem } from '../../../requests/removeDaggerheartItem';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
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
    }
  },
  ru: {
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
    }
  }
}

export const DaggerheartItems = () => {
  const [itemForm, setItemForm] = createStore({ name: '', description: '', kind: 'item' });

  const [items, setItems] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchItems = async () => await fetchDaggerheartItems(appState.accessToken, 'item,consumable');

    Promise.all([fetchItems()]).then(
      ([itemsDate]) => {
        setItems(itemsDate.items);
      }
    );
  });

  const openCreateItemModal = () => {
    batch(() => {
      setItemForm({ id: null, name: '', description: '', kind: 'item' });
      openModal();
    });
  }

  const openChangeItemModal = (item) => {
    batch(() => {
      setItemForm({ id: item.id, name: item.name.en, description: item.description.en });
      openModal();
    });
  }

  const saveItem = () => {
    if (itemForm.name.length === 0) return renderAlert(TRANSLATION[locale()].requiredName);

    itemForm.id === null ? createItem() : updateItem();
  }

  const createItem = async () => {
    const result = await createDaggerheartItem(appState.accessToken, { brewery: itemForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setItems([result.item].concat(items()));
        setItemForm({ id: null, name: '', description: '', kind: 'item' });
        closeModal();
      });
    }
  }

  const updateItem = async () => {
    const result = await changeDaggerheartItem(appState.accessToken, itemForm.id, { brewery: itemForm, only_head: true });

    if (result.errors_list === undefined) {
      const newItems = items().map((item) => {
        if (itemForm.id !== item.id) return item;

        return {
          ...item,
          name: { en: itemForm.name, ru: itemForm.name },
          description: { en: itemForm.description, ru: itemForm.description }
        };
      });

      batch(() => {
        setItems(newItems);
        setItemForm({ id: null, name: '', description: '', kind: 'item' });
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
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateItemModal}>{TRANSLATION[locale()]['add']}</Button>
      <table class="w-full table">
        <thead>
          <tr class="text-sm">
            <td class="p-1" />
            <td class="p-1">{TRANSLATION[locale()].kindTable}</td>
            <td class="p-1">{TRANSLATION[locale()].description}</td>
          </tr>
        </thead>
        <tbody>
          <For each={items()}>
            {(item) =>
              <tr>
                <td class="minimum-width py-1">{item.name[locale()]}</td>
                <td class="minimum-width py-1 text-sm">{TRANSLATION[locale()].kinds[item.kind]}</td>
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
        <p class="mb-2 text-xl">{TRANSLATION[locale()]['newItemTitle']}</p>
        <Input
          containerClassList="form-field mb-4"
          labelText={TRANSLATION[locale()]['name']}
          value={itemForm.name}
          onInput={(value) => setItemForm({ ...itemForm, name: value })}
        />
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()]['kind']}
          items={translate({ "item": { "name": { "en": "Item", "ru": "Предмет" } }, "consumable": { "name": { "en": "Consumable", "ru": "Расходник" } } }, locale())}
          selectedValue={itemForm.kind}
          onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
        />
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
