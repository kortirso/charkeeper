import { createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button, Checkbox } from '../../../atoms';
import { createModal } from '../../../molecules';

import { ItemsTable } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DaggerheartEquipment = (props) => {
  const character = () => props.character;
  const characterItems = () => props.characterItems;

  const [changingItem, setChangingItem] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const changeItem = (item) => {
    batch(() => {
      setChangingItem(item);
      openModal();
    });
  }

  const updateItem = async () => {
    const result = await props.onUpdateCharacterItem(
      changingItem(),
      { character_item: { quantity: changingItem().quantity, notes: changingItem().notes } }
    );

    if (result.errors === undefined) closeModal();
  }

  const updateAttribute = async (attribute, key, value) => {
    const currentValue = character()[attribute][key];
    const newValue = currentValue === value ? (value - 1) : value;

    const payload = { ...character()[attribute], [key]: newValue };

    const result = await updateCharacterRequest(
      appState.accessToken, 'daggerheart', character().id, { character: { [attribute]: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [attribute]: payload });
    else renderAlerts(result.errors);
  }

  return (
    <>
      <div class="white-box mb-2 p-4">
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.coins')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.coins >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'coins', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.handfuls')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.handfuls >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'handfuls', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-2">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.bags')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.bags >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'bags', index)}
                />
              }
            </For>
          </div>
        </div>
        <div class="mb-4">
          <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.gold.chests')}</p>
          <div class="flex">
            <For each={Array.from([...Array(10).keys()], (x) => x + 1)}>
              {(index) =>
                <Checkbox
                  filled
                  checked={character().gold.chests >= index}
                  classList="mr-1"
                  onToggle={() => updateAttribute('gold', 'chests', index)}
                />
              }
            </For>
          </div>
        </div>
        <p class="text-right">
          {t('daggerheart.gold.total')} - {character().gold.chests * 1000 + character().gold.bags * 100 + character().gold.handfuls * 10 + character().gold.coins}
        </p>
      </div>
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
          <label class="text-sm/4 font-cascadia-light text-gray-400">{t('character.itemNote')}</label>
          <textarea
            rows="2"
            class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
            onInput={(e) => setChangingItem({ ...changingItem(), notes: e.target.value })}
            value={changingItem().notes}
          />
          <Button default textable onClick={updateItem}>{t('save')}</Button>
        </Show>
      </Modal>
    </>
  );
}
