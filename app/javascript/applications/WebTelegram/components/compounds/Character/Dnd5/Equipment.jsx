import { createSignal, For, Show, createMemo, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Button, IconButton } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const Dnd5Equipment = (props) => {
  const character = () => props.character;

  const [coinsData, setCoinsData] = createSignal(character().coins);
  const [modalOpenMode, setModalOpenMode] = createSignal(null);
  const [changingItem, setChangingItem] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const changeItemQuantity = (item) => {
    batch(() => {
      setModalOpenMode('changeItemQuantity');
      setChangingItem(item);
      openModal();
    });
  }

  const changeCoins = () => {
    batch(() => {
      setModalOpenMode('changeCoins');
      openModal();
    });
  }

  // submits
  const updateCoins = async () => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: { coins: coinsData() }, only_head: true });

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter({ coins: coinsData() });
        closeModal();
      });
    } else renderAlerts(result.errors);
  }

  const updateItem = async () => {
    const result = await props.onUpdateCharacterItem(
      changingItem(),
      { character_item: { quantity: changingItem().quantity, notes: changingItem().notes } }
    );

    if (result.errors === undefined) closeModal();
  }

  // rendering
  const calculateCurrentLoad = createMemo(() => {
    if (props.characterItems === undefined) return 0;

    return props.characterItems.reduce((acc, item) => acc + item.quantity * item.weight, 0);
  });

  const renderItemsBox = (title, items) => (
    <div class="p-4 white-box mb-2">
      <h2 class="text-lg">{title}</h2>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <td class="text-center text-nowrap px-2">{t('equipment.quantity')}</td>
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p>{item.name}</p>
                  <Show when={item.notes}>
                    <p class="text-sm mt-1">{item.notes}</p>
                  </Show>
                </td>
                <td class="py-1">
                  <p
                    class="p-1 text-center cursor-pointer bordered"
                    onClick={() => changeItemQuantity(item)}
                  >{item.quantity}</p>
                </td>
                <td>
                  <div class="flex items-center">
                    <Switch>
                      <Match when={item.ready_to_use}>
                        <span
                          class="text-sm cursor-pointer"
                          onClick={() => props.onUpdateCharacterItem(item, { character_item: { ready_to_use: false } })}
                        >Pack</span>
                      </Match>
                      <Match when={!item.ready_to_use}>
                        <span
                          class="text-sm cursor-pointer"
                          onClick={() => props.onUpdateCharacterItem(item, { character_item: { ready_to_use: true } })}
                        >Equip</span>
                      </Match>
                    </Switch>
                    <IconButton classList="ml-2 text-sm" onClick={() => props.onRemoveCharacterItem(item)}>
                      <Close />
                    </IconButton>
                  </div>
                </td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <StatsBlock
        items={[
          { title: t('equipment.gold'), value: character().coins.gold },
          { title: t('equipment.silver'), value: character().coins.silver },
          { title: t('equipment.copper'), value: character().coins.copper }
        ]}
        onClick={changeCoins}
      />
      <Show when={props.characterItems !== undefined}>
        <Button default textable classList="mb-2" onClick={props.onNavigatoToItems}>{t('character.items')}</Button>
        {renderItemsBox(t('character.equipment'), props.characterItems.filter((item) => item.ready_to_use))}
        {renderItemsBox(t('character.backpack'), props.characterItems.filter((item) => !item.ready_to_use))}
        <div class="flex justify-end">
          <div class="p-4 flex white-box">
            <p>{calculateCurrentLoad()} / {character().load}</p>
          </div>
        </div>
      </Show>
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <Switch>
            <Match when={modalOpenMode() === 'changeCoins'}>
              <For each={['gold', 'silver', 'copper']}>
                {(coin) =>
                  <div class="mb-4 flex justify-between items-center">
                    <p class="flex-1 text-sm">{t(`equipment.${coin}`)}</p>
                    <Input
                      numeric
                      containerClassList="w-20 ml-4"
                      value={coinsData()[coin]}
                      onInput={(value) => setCoinsData({ ...coinsData(), [coin]: Number(value) })}
                    />
                  </div>
                }
              </For>
              <Button default textable onClick={updateCoins}>{t('save')}</Button>
            </Match>
            <Match when={modalOpenMode() === 'changeItemQuantity'}>
              <div>
                <div class="mb-2 flex items-center">
                  <p class="flex-1 text-sm text-left">{changingItem().name}</p>
                  <Input
                    numeric
                    containerClassList="w-20 ml-8"
                    value={changingItem().quantity}
                    onInput={(value) => setChangingItem({ ...changingItem(), quantity: Number(value) })}
                  />
                </div>
                <label class="text-sm">{t('character.itemNote')}</label>
                <textarea
                  rows="2"
                  class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
                  onInput={(e) => setChangingItem({ ...changingItem(), notes: e.target.value })}
                  value={changingItem().notes}
                />
              </div>
              <Button default textable onClick={updateItem}>{t('save')}</Button>
            </Match>
          </Switch>
        </div>
      </Modal>
    </>
  );
}
