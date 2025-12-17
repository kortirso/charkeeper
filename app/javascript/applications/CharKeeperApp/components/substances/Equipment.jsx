import { createSignal, createEffect, For, Show, createMemo, batch, children } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { ItemsTable, createModal, ErrorWrapper, Input, Button, Toggle, TextArea, GuideWrapper } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { PlusSmall, Info } from '../../assets';
import { fetchItemsRequest } from '../../requests/fetchItemsRequest';
import { fetchCharacterItemsRequest } from '../../requests/fetchCharacterItemsRequest';
import { createCharacterItemRequest } from '../../requests/createCharacterItemRequest';
import { updateCharacterItemRequest } from '../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../requests/removeCharacterItemRequest';
import { fetchItemInfoRequest } from '../../requests/fetchItemInfoRequest';
import { createCharacterHomebrewItemRequest } from '../../requests/createCharacterHomebrewItemRequest';

const TRANSLATION = {
  en: {
    searchByName: 'Search by name (from 3 characters)',
    clear: 'Clear',
    createHomebrew: 'Add homebrew item',
    homebrewName: 'Item name',
    homebrewDescription: 'Item description',
    add: 'Add',
    tooltip: "Once you've crafted an item, you can edit it in the <a href='https://charkeeper.org/homebrews' class='underline' target='_blank' rel='noopener noreferrer'>Homebrews</a> section, even converting it into a weapon or armor.",
    in: {
      hands: {
        title: 'In hands',
        description: 'Items in your hands'
      },
      equipment: {
        title: 'On body',
        description: 'Equiped armor, ammo for weapon, consumables'
      },
      backpack: {
        title: 'In backpack',
        description: "Items in backpack, can't be quickly used"
      },
      storage: {
        title: 'In storage',
        description: 'Outer storage of your items'
      }
    }
  },
  ru: {
    searchByName: 'Поиск по названию (от 3 символов)',
    clear: 'Очистить',
    createHomebrew: 'Добавление homebrew предмета',
    homebrewName: 'Название предмета',
    homebrewDescription: 'Описание предмета',
    add: 'Добавить',
    tooltip: "После создания предмета вы сможете его отредактировать в разделе <a href='https://charkeeper.org/homebrews' class='underline' target='_blank' rel='noopener noreferrer'>Homebrews</a>, даже преобразовать в оружие или броню",
    in: {
      hands: {
        title: 'В руках',
        description: "Предметы в руках"
      },
      equipment: {
        title: 'На теле',
        description: 'Экипированный доспех, боеприпасы, расходные материалы'
      },
      backpack: {
        title: 'В рюкзаке',
        description: 'Предметы в рюкзаке, не могут быть быстро использованы'
      },
      storage: {
        title: 'В хранилище',
        description: 'Предметы в отдалённом хранилище'
      }
    }
  }
}
const CREATE_HOMEBREW_ITEMS = ['daggerheart'];

export const Equipment = (props) => {
  const safeChildren = children(() => props.children);

  const character = () => props.character;

  const [homebrewItem, setHomebrewItem] = createStore({ name: '', description: '' });

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [itemsSelectingMode, setItemsSelectingMode] = createSignal(false);

  const [changingItem, setChangingItem] = createSignal(null);
  const [itemInfo, setItemInfo] = createSignal(null);
  const [filterByName, setFilterByName] = createSignal('');

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
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
  const updateItem = () => {
    if (Object.values(changingItem().states).reduce((acc, item) => acc + item, 0) === 0) {
      return removeCharacterItem(changingItem());
    }

    updateCharacterItem(
      changingItem(),
      { character_item: { states: changingItem().states, notes: changingItem().notes } }
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
        closeModal();
      });
    }
  }

  const removeCharacterItem = async (item) => {
    const result = await removeCharacterItemRequest(
      appState.accessToken, character().provider, character().id, item.id
    );
    if (result.errors_list === undefined) {
      batch(() => {
        if (item.kind.includes('weapon') || item.state === 'hands') {
          reloadCharacterItems();
          props.onReloadCharacter();
        } else setCharacterItems(characterItems().filter((element) => element !== item));
        closeModal();
        setChangingItem(null);
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

  const addHomebrewItem = async () => {
    const result = await createCharacterHomebrewItemRequest(
      appState.accessToken, character().provider, character().id, { item: homebrewItem }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        reloadCharacterItems();
        setHomebrewItem({ name: '', description: '' })
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Equipment' }}>
      <GuideWrapper
        character={character()}
        guideStep={props.guideStep}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        onNextClick={props.onNextGuideStepClick}
      >
        <Show
          when={!itemsSelectingMode()}
          fallback={
            <>
              <div class="mb-2 flex">
                <Input
                  containerClassList="mr-2 flex-1"
                  placeholder={TRANSLATION[locale()].searchByName}
                  value={filterByName()}
                  onInput={(value) => setFilterByName(value)}
                />
                <Button default size="small" classList="px-2" onClick={() => setFilterByName('')}>
                  {TRANSLATION[locale()].clear}
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
                                    
                                  </p>
                                </td>
                                <Show when={props.withWeight}><td class="py-1 text-center">{item.data.weight}</td></Show>
                                <Show when={props.withPrice}><td class="py-1 text-center">{item.data.price / 100}</td></Show>
                                <td>
                                  <div class="flex justify-end gap-x-2">
                                    <Show when={item.has_description}>
                                      <Button default size="small" onClick={() => showInfo(item.id, item.name)}>
                                        <Info width="20" height="20" />
                                      </Button>
                                    </Show>
                                    <Button default size="small" onClick={() => buyItem(item)}>
                                      <PlusSmall />
                                    </Button>
                                  </div>
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
                  title={TRANSLATION[locale()].in[state].title}
                  subtitle={TRANSLATION[locale()].in[state].description}
                  state={state}
                  items={characterItems().filter((item) => item.states[state] > 0)}
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
                  <p>{calculateCurrentLoad()} / {character().load}</p>
                </div>
              </div>
            </Show>
            <Show when={CREATE_HOMEBREW_ITEMS.includes(character().provider)}>
              <Toggle title={TRANSLATION[locale()].createHomebrew}>
                <Input
                  containerClassList="mb-2"
                  labelText={TRANSLATION[locale()].homebrewName}
                  value={homebrewItem.name}
                  onInput={(value) => setHomebrewItem({ ...homebrewItem, name: value })}
                />
                <TextArea
                  rows="4"
                  containerClassList="mb-2"
                  labelText={TRANSLATION[locale()].homebrewDescription}
                  value={homebrewItem.description}
                  onChange={(value) => setHomebrewItem({ ...homebrewItem, description: value })}
                />
                <p
                  class="mb-4 text-sm"
                  innerHTML={TRANSLATION[locale()].tooltip} // eslint-disable-line solid/no-innerhtml
                />
                <Button default onClick={addHomebrewItem}>{TRANSLATION[locale()].add}</Button>
              </Toggle>
            </Show>
          </Show>
        </Show>
      </GuideWrapper>
      <Modal classList="md:max-w-md!">
        <Show when={changingItem()}>
          <p class="text-lg mb-2">{changingItem().name}</p>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <For each={['hands', 'equipment', 'backpack', 'storage']}>
              {(state) =>
                <Input
                  numeric
                  labelText={TRANSLATION[locale()].in[state].title}
                  value={changingItem().states[state]}
                  onInput={(value) => setChangingItem({ ...changingItem(), states: { ...changingItem().states, [state]: parseInt(value) } })}
                />
              }
            </For>
          </div>
          <TextArea
            rows="2"
            labelText={t('equipment.itemNote')}
            onChange={(value) => setChangingItem({ ...changingItem(), notes: value })}
            value={changingItem().notes}
          />
          <Button default textable classList="mt-4" onClick={updateItem}>{t('save')}</Button>
        </Show>
        <Show when={itemInfo()}>
          <p class="mb-3 text-xl">{itemInfo()[0]}</p>
          <p>{itemInfo()[1]}</p>
        </Show>
      </Modal>
    </ErrorWrapper>
  );
}
