import { createSignal, createEffect, For, Show, createMemo, batch, children } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../molecules';
import { Input, Button, Toggle, TextArea } from '../../../atoms';

import { ItemsTable } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall } from '../../../../assets';

import { fetchItemsRequest } from '../../../../requests/fetchItemsRequest';
import { fetchCharacterItemsRequest } from '../../../../requests/fetchCharacterItemsRequest';
import { createCharacterItemRequest } from '../../../../requests/createCharacterItemRequest';
import { updateCharacterItemRequest } from '../../../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../../../requests/removeCharacterItemRequest';

export const Equipment = (props) => {
  const safeChildren = children(() => props.children);

  const character = () => props.character;

  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [itemsSelectingMode, setItemsSelectingMode] = createSignal(false);
  const [changingItem, setChangingItem] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (characterItems() !== undefined) return;
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, character().provider);

    Promise.all([fetchCharacterItems(), fetchItems()]).then(
      ([characterItemsData, itemsData]) => {
        batch(() => {
          setCharacterItems(characterItemsData.items);
          setItems(itemsData.items.sort((a, b) => a.name > b.name));
        });
      }
    );
  });

  const reloadCharacterItems = async () => {
    const result = await fetchCharacterItems();
    setCharacterItems(result.items);
  }

  // actions
  const changeItem = (item) => {
    batch(() => {
      setChangingItem(item);
      openModal();
    });
  }

  // submits
  const updateItem = async () => {
    await updateCharacterItem(
      changingItem(),
      { character_item: { quantity: changingItem().quantity, notes: changingItem().notes } }
    );
  }

  const buyItem = async (item) => {
    const result = await createCharacterItemRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { item_id: item.id }
    );

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind.includes('weapon')) props.onReloadCharacter();
        reloadCharacterItems();
        renderNotice(t('alerts.itemIsAdded'));
      });
    }
  }

  const updateCharacterItem = async (item, payload) => {
    const result = await updateCharacterItemRequest(
      appState.accessToken, character().provider, character().id, item.id, payload
    );

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') props.onReloadCharacter(); // weapon/armor
        const newValue = characterItems().slice().map((element) => {
          if (element.id !== item.id) return element;
          return { ...element, ...payload.character_item } 
        });
        setCharacterItems(newValue);
        closeModal()
      });
    }
  }

  const removeCharacterItem = async (item) => {
    const result = await removeCharacterItemRequest(
      appState.accessToken, character().provider, character().id, item.id
    );
    if (result.errors === undefined) {
      batch(() => {
        if (item.kind.includes('weapon') || item.ready_to_use) reloadCharacterItems();
        else setCharacterItems(characterItems().filter((element) => element !== item));
      });
    }
  }

  // rendering
  const calculateCurrentLoad = createMemo(() => {
    if (characterItems() === undefined) return 0;

    return characterItems().reduce((acc, item) => acc + item.quantity * item.data.weight, 0);
  });

  const renderItems = (title, items) => (
    <Toggle title={title}>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <Show when={props.withWeight}><td class="text-center px-2">{t('equipment.weight')}</td></Show>
            <Show when={props.withPrice}><td class="text-center text-nowrap px-2">{t('equipment.cost')}</td></Show>
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p class="font-cascadia-light">{item.name}</p>
                </td>
                <Show when={props.withWeight}><td class="py-1 text-center">{item.data.weight}</td></Show>
                <Show when={props.withPrice}><td class="py-1 text-center">{item.data.price / 100}</td></Show>
                <td>
                  <Button default size="small" onClick={() => buyItem(item)}>
                    <PlusSmall />
                  </Button>
                </td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </Toggle>
  );

  return (
    <>
      <Show
        when={!itemsSelectingMode()}
        fallback={
          <>
            <For each={props.itemFilters}>
              {(itemFilter) =>
                renderItems(itemFilter.title, items().filter(itemFilter.callback))
              }
            </For>
            <Button default textable onClick={() => setItemsSelectingMode(false)}>{t('back')}</Button>
          </>
        }
      >
        {safeChildren()}
        <Show when={characterItems() !== undefined}>
          <Button default textable classList="mb-2" onClick={() => setItemsSelectingMode(true)}>{t('character.items')}</Button>
          <ItemsTable
            title={t('character.equipment')}
            items={characterItems().filter((item) => item.ready_to_use)}
            onChangeItem={changeItem}
            onUpdateCharacterItem={updateCharacterItem}
            onRemoveCharacterItem={removeCharacterItem}
          />
          <ItemsTable
            title={t('character.backpack')}
            items={characterItems().filter((item) => !item.ready_to_use)}
            onChangeItem={changeItem}
            onUpdateCharacterItem={updateCharacterItem}
            onRemoveCharacterItem={removeCharacterItem}
          />
          <Show when={props.withWeight}>
            <div class="flex justify-end">
              <div class="p-4 flex white-box">
                <p>{calculateCurrentLoad()} / {character().load}</p>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
      <Modal>
        <Show when={changingItem()}>
          <div class="mb-2 flex items-center">
            <p class="flex-1 text-sm text-left font-cascadia-light">{changingItem().name}</p>
            <Input
              numeric
              containerClassList="w-20 ml-8"
              value={changingItem().quantity}
              onInput={(value) => setChangingItem({ ...changingItem(), quantity: Number(value) })}
            />
          </div>
          <TextArea
            rows="2"
            labelText={t('character.itemNote')}
            onChange={(value) => setChangingItem({ ...changingItem(), notes: value })}
            value={changingItem().notes}
          />
          <Button default textable onClick={updateItem}>{t('save')}</Button>
        </Show>
      </Modal>
    </>
  );
}
