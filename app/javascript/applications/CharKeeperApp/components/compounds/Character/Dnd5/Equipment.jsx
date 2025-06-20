import { createSignal, For, Show, createMemo, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Button } from '../../../atoms';

import { ItemsTable } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const Dnd5Equipment = (props) => {
  const character = () => props.character;
  const characterItems = () => props.characterItems;

  const [coinsData, setCoinsData] = createSignal(character().coins);
  const [modalOpenMode, setModalOpenMode] = createSignal(null);
  const [changingItem, setChangingItem] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const changeItem = (item) => {
    batch(() => {
      setModalOpenMode('changeItem');
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
    if (characterItems() === undefined) return 0;

    return characterItems().reduce((acc, item) => acc + item.quantity * item.data.weight, 0);
  });

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
      <Show when={characterItems() !== undefined}>
        <Button default textable classList="mb-2" onClick={props.onNavigatoToItems}>{t('character.items')}</Button>
        <ItemsTable
          title={t('character.equipment')}
          items={characterItems().filter((item) => item.ready_to_use)}
          onChangeItem={changeItem}
          onUpdateCharacterItem={props.onUpdateCharacterItem}
          onRemoveCharacterItem={props.onRemoveCharacterItem}
        />
        <ItemsTable
          title={t('character.backpack')}
          items={characterItems().filter((item) => !item.ready_to_use)}
          onChangeItem={changeItem}
          onUpdateCharacterItem={props.onUpdateCharacterItem}
          onRemoveCharacterItem={props.onRemoveCharacterItem}
        />
        <div class="flex justify-end">
          <div class="p-4 flex white-box">
            <p>{calculateCurrentLoad()} / {character().load}</p>
          </div>
        </div>
      </Show>
      <Modal>
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
          <Match when={modalOpenMode() === 'changeItem'}>
            <div class="mb-2 flex items-center">
              <p class="flex-1 text-sm text-left font-cascadia-light">{changingItem().name}</p>
              <Input
                numeric
                containerClassList="w-20 ml-8"
                value={changingItem().quantity}
                onInput={(value) => setChangingItem({ ...changingItem(), quantity: Number(value) })}
              />
            </div>
            <label class="text-sm/4 font-cascadia-light text-gray-400">{t('character.itemNote')}</label>
            <textarea
              rows="2"
              class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
              onInput={(e) => setChangingItem({ ...changingItem(), notes: e.target.value })}
              value={changingItem().notes}
            />
            <Button default textable onClick={updateItem}>{t('save')}</Button>
          </Match>
        </Switch>
      </Modal>
    </>
  );
}
