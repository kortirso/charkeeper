import { createEffect, createSignal, Switch, Match, batch, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, DaggerheartCombat, DaggerheartEquipment, Notes, Avatar, CharacterNavigation, DaggerheartLeveling,
  DaggerheartItems, Bonuses
} from '../../../components';
import { useAppState, useAppAlert, useAppLocale } from '../../../context';

import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { fetchCharacterItemsRequest } from '../../../requests/fetchCharacterItemsRequest';
import { createCharacterItemRequest } from '../../../requests/createCharacterItemRequest';
import { updateCharacterItemRequest } from '../../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../../requests/removeCharacterItemRequest';

export const Daggerheart = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('traits');
  const [activeItemsTab, setActiveItemsTab] = createSignal(false);

  const [items, setItems] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (activeTab() !== 'equipment') return;
    if (characterItems() !== undefined) return;

    const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, 'daggerheart', appState.activePageParams.id);

    Promise.all([fetchCharacterItems()]).then(
      ([characterItemsData]) => {
        setCharacterItems(characterItemsData.items);
      }
    );
  });

  createEffect(() => {
    if (!activeItemsTab()) return;
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart');

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        setItems(itemsData.items.sort((a, b) => a.name > b.name));
      }
    );
  });

  const reloadCharacterItems = async () => {
    const characterItemsData = await fetchCharacterItemsRequest(appState.accessToken, 'daggerheart', appState.activePageParams.id);
    setCharacterItems(characterItemsData.items);
  }

  const buyItem = async (item) => {
    const result = await createCharacterItemRequest(appState.accessToken, 'daggerheart', props.character.id, { item_id: item.id });

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') props.onReloadCharacter();
        reloadCharacterItems();
        renderNotice(t('alerts.itemIsAdded'));
      });
    }
    return result;
  }

  const updateCharacterItem = async (item, payload) => {
    const result = await updateCharacterItemRequest(appState.accessToken, 'daggerheart', props.character.id, item.id, payload);

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') props.onReloadCharacter(); // weapon/armor
        const result = characterItems().slice().map((element) => {
          if (element.id !== item.id) return element;

          return { ...element, ...payload.character_item }
        });
        setCharacterItems(result);
      });
    }
    return result;
  }

  const removeCharacterItem = async (item) => {
    const result = await removeCharacterItemRequest(appState.accessToken, 'daggerheart', props.character.id, item.id);

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') reloadCharacterItems();
        else setCharacterItems(characterItems().filter((element) => element !== item));
      });
    }
  }

  return (
    <>
      <CharacterNavigation
        tabsList={['traits', 'combat', 'equipment', 'bonuses', 'notes', 'classLevels', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
      <div class="p-2 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'traits'}>
            <DaggerheartTraits
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <DaggerheartCombat
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <Show
              when={!activeItemsTab()}
              fallback={
                <DaggerheartItems
                  items={items()}
                  onBuyItem={buyItem}
                  onNavigatoToEquipment={() => setActiveItemsTab(false)}
                />
              }
            >
              <DaggerheartEquipment
                character={character()}
                characterItems={characterItems()}
                onNavigatoToItems={() => setActiveItemsTab(true)}
                onUpdateCharacterItem={updateCharacterItem}
                onRemoveCharacterItem={removeCharacterItem}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Show>
          </Match>
          <Match when={activeTab() === 'bonuses'}>
            <Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Notes />
          </Match>
          <Match when={activeTab() === 'classLevels'}>
            <DaggerheartLeveling
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'avatar'}>
            <Avatar
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
        </Switch>
      </div>
    </>
  );
}
