import { createSignal, For, Show, createMemo, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input } from '../../../atoms';

import { useAppLocale } from '../../../../context';

export const Dnd5Equipment = (props) => {
  const [coinsData, setCoinsData] = createSignal(props.initialCoins);
  const [modalOpenMode, setModalOpenMode] = createSignal(null);
  const [changingItem, setChangingItem] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
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
    const result = await props.onRefreshCharacter({ coins: coinsData() });

    if (result.errors === undefined) closeModal();
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
                  <span
                    class="ml-2 text-sm cursor-pointer"
                    onClick={() => props.onRemoveCharacterItem(item)}
                  >X</span>
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
          { title: t('equipment.gold'), value: coinsData().gold },
          { title: t('equipment.silver'), value: coinsData().silver },
          { title: t('equipment.copper'), value: coinsData().copper }
        ]}
        onClick={changeCoins}
      />
      <Show when={props.characterItems !== undefined}>
        <button
          class="btn-primary mb-2"
          onClick={props.onNavigatoToItems} // eslint-disable-line solid/reactivity
        >{t('character.items')}</button>
        {renderItemsBox(t('character.equipment'), props.characterItems.filter((item) => item.ready_to_use))}
        {renderItemsBox(t('character.backpack'), props.characterItems.filter((item) => !item.ready_to_use))}
        <div class="flex justify-end">
          <div class="p-4 flex white-box">
            <p>{calculateCurrentLoad()} / {props.load}</p>
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
                      classList="w-20 ml-4"
                      value={coinsData()[coin]}
                      onInput={(value) => setCoinsData({ ...coinsData(), [coin]: Number(value) })}
                    />
                  </div>
                }
              </For>
              <button class="btn-primary" onClick={updateCoins}>{t('save')}</button>
            </Match>
            <Match when={modalOpenMode() === 'changeItemQuantity'}>
              <div>
                <div class="mb-2 flex items-center">
                  <p class="flex-1 text-sm text-left">{changingItem().name}</p>
                  <Input
                    numeric
                    classList="w-20 ml-8"
                    value={changingItem().quantity}
                    onInput={(value) => setChangingItem({ ...changingItem(), quantity: Number(value) })}
                  />
                </div>
                <textarea
                  rows="2"
                  class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
                  onInput={(e) => setChangingItem({ ...changingItem(), notes: e.target.value })}
                  value={changingItem().notes}
                />
              </div>
              <button class="btn-primary" onClick={updateItem}>{t('save')}</button>
            </Match>
          </Switch>
        </div>
      </Modal>
    </>
  );
}
