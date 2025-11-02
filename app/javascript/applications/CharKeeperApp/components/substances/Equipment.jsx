import { createSignal, createEffect, For, Show, createMemo, batch, children } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ItemsTable, createModal, ErrorWrapper, Input, Button, Toggle, TextArea, GuideWrapper } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { PlusSmall } from '../../assets';
import { fetchItemsRequest } from '../../requests/fetchItemsRequest';
import { fetchCharacterItemsRequest } from '../../requests/fetchCharacterItemsRequest';
import { createCharacterItemRequest } from '../../requests/createCharacterItemRequest';
import { updateCharacterItemRequest } from '../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../requests/removeCharacterItemRequest';
import { fetchItemInfoRequest } from '../../requests/fetchItemInfoRequest';

const TRANSLATION = {
  en: {
    searchByName: 'Search by name (from 3 characters)',
    clear: 'Clear'
  },
  ru: {
    searchByName: 'Поиск по названию (от 3 символов)',
    clear: 'Очистить'
  }
}

export const Equipment = (props) => {
  const safeChildren = children(() => props.children);

  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [itemsSelectingMode, setItemsSelectingMode] = createSignal(false);
  const [changingItem, setChangingItem] = createSignal(null);
  const [itemInfo, setItemInfo] = createSignal(null);
  const [filterByName, setFilterByName] = createSignal('');

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, character().provider);

    Promise.all([fetchCharacterItems(), fetchItems()]).then(
      ([characterItemsData, itemsData]) => {
        batch(() => {
          setCharacterItems(characterItemsData.items);
          setItems(itemsData.items.sort((a, b) => a.name > b.name));
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const reloadCharacterItems = async () => {
    const result = await fetchCharacterItems();
    setCharacterItems(result.items);
  }

  // actions
  const changeItem = (item) => {
    batch(() => {
      setChangingItem(item);
      setItemInfo(null);
      openModal();
    });
  }

  const showInfo = async (id, name) => {
    const result = await fetchItemInfoRequest(appState.accessToken, id);

    if (result.errors_list === undefined) {
      batch(() => {
        openModal();
        setChangingItem(null);
        setItemInfo([name, result.value]);
      });
    }
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

    if (result.errors_list === undefined) {
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

    if (result.errors_list === undefined) {
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
    if (result.errors_list === undefined) {
      batch(() => {
        if (item.kind.includes('weapon') || item.state === 'hands') reloadCharacterItems();
        else setCharacterItems(characterItems().filter((element) => element !== item));
      });
    }
  }

  // rendering
  const calculateCurrentLoad = createMemo(() => {
    if (characterItems() === undefined) return 0;

    return characterItems().reduce((acc, item) => acc + item.quantity * item.data.weight, 0);
  });

  const filteredItems = createMemo(() => {
    if (items() === undefined) return [];
    if (filterByName().length < 3) return items();

    const searchPattern = filterByName().toLowerCase();
    return items().filter((item) => item.name.toLowerCase().includes(searchPattern));
  });

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Equipment' }}>
      <GuideWrapper
        character={character()}
        guideStep={props.guideStep}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
      >
        <Show
          when={!itemsSelectingMode()}
          fallback={
            <>
              <div class="mb-2 flex">
                <Input
                  containerClassList="mr-2 flex-1"
                  placeholder={TRANSLATION[locale()]['searchByName']}
                  value={filterByName()}
                  onInput={(value) => setFilterByName(value)}
                />
                <Button default size="small" classList="px-2" onClick={() => setFilterByName('')}>
                  {TRANSLATION[locale()]['clear']}
                </Button>
              </div>
              <For each={props.itemFilters}>
                {(itemFilter) =>
                  <Show when={filteredItems().filter(itemFilter.callback).length > 0}>
                    <Toggle isOpenByParent={filterByName().length >= 3} title={itemFilter.title}>
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
                          <For each={filteredItems().filter(itemFilter.callback)}>
                            {(item) =>
                              <tr>
                                <td class="py-1 pl-1">
                                  <p>
                                    {item.name}
                                    <Show when={item.homebrew}>
                                      <span title="Homebrew" class="text-xs ml-2">HB</span>
                                    </Show>
                                    <Show when={item.has_description}>
                                      <span
                                        title="Info"
                                        class="text-xs ml-2 cursor-pointer"
                                        onClick={() => showInfo(item.id, item.name)}
                                      >I</span>
                                    </Show>
                                  </p>
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
                  </Show>
                }
              </For>
              <Button default textable onClick={() => setItemsSelectingMode(false)}>{t('back')}</Button>
            </>
          }
        >
          {safeChildren()}
          <Show when={characterItems() !== undefined}>
            <Button default textable classList="mb-2" onClick={() => setItemsSelectingMode(true)}>{t('equipment.addItems')}</Button>
            <For each={['hands', 'equipment', 'backpack', 'storage']}>
              {(state) =>
                <ItemsTable
                  title={t(`equipment.in.${state}.title`)}
                  subtitle={t(`equipment.in.${state}.description`)}
                  state={state}
                  items={characterItems().filter((item) => item.state === state)}
                  onChangeItem={changeItem}
                  onInfoItem={showInfo}
                  onUpdateCharacterItem={updateCharacterItem}
                  onRemoveCharacterItem={removeCharacterItem}
                />
              }
            </For>
            <Show when={props.withWeight}>
              <div class="flex justify-end">
                <div class="p-4 flex blockable">
                  <p class="dark:text-snow">{calculateCurrentLoad()} / {character().load}</p>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
      </GuideWrapper>
      <Modal classList="md:max-w-md!">
        <Show when={changingItem()}>
          <div class="mb-2 flex items-center">
            <p class="flex-1 text-sm text-left dark:text-snow">{changingItem().name}</p>
            <Input
              numeric
              containerClassList="w-20 ml-8"
              value={changingItem().quantity}
              onInput={(value) => setChangingItem({ ...changingItem(), quantity: Number(value) })}
            />
          </div>
          <TextArea
            rows="2"
            labelText={t('equipment.itemNote')}
            onChange={(value) => setChangingItem({ ...changingItem(), notes: value })}
            value={changingItem().notes}
          />
          <Button default textable classList="mt-2" onClick={updateItem}>{t('save')}</Button>
        </Show>
        <Show when={itemInfo()}>
          <p class="mb-3 text-xl">{itemInfo()[0]}</p>
          <p>{itemInfo()[1]}</p>
        </Show>
      </Modal>
    </ErrorWrapper>
  );
}
