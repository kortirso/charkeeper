import { createSignal, Switch, Match, batch, Show, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5Rest, Dnd5ClassLevels, Dnd5Professions, Dnd5Equipment, Dnd5Items,
  Dnd5Spellbook, Dnd5Spells, Notes, Avatar, CharacterNavigation
} from '../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';

import { fetchCharacterItemsRequest } from '../../../requests/fetchCharacterItemsRequest';
import { fetchCharacterSpellsRequest } from '../../../requests/fetchCharacterSpellsRequest';
import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';
import { updateCharacterItemRequest } from '../../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../../requests/removeCharacterItemRequest';
import { fetchSpellsRequest } from '../../../requests/fetchSpellsRequest';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createCharacterSpellRequest } from '../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../requests/removeCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../requests/updateCharacterSpellRequest';
import { createCharacterItemRequest } from '../../../requests/createCharacterItemRequest';

export const Dnd5 = (props) => {
  const character = () => props.character;
  const spellClassesList = () => Object.keys(character().spell_classes);

  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');
  const [activeItemsTab, setActiveItemsTab] = createSignal(false);
  const [activeSpellsTab, setActiveSpellsTab] = createSignal(false);

  // page data
  const [items, setItems] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);

  // shared state
  const [energyData, setEnergyData] = createSignal(character().energy);
  const [spentSpellSlots, setSpentSpellSlots] = createSignal(character().spent_spell_slots);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // initial data fetching
  createEffect(() => {
    if (activeTab() !== 'equipment') return;
    if (characterItems() !== undefined) return;

    const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);

    Promise.all([fetchCharacterItems()]).then(
      ([characterItemsData]) => {
        setCharacterItems(characterItemsData.items);
      }
    );
  });

  createEffect(() => {
    if (!activeItemsTab() && activeTab() !== 'professions') return;
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'dnd5');

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        setItems(itemsData.items.sort((a, b) => a.name > b.name));
      }
    );
  });

  createEffect(() => {
    if (activeTab() !== 'spells') return;
    if (spellClassesList().length === 0) return;
    if (characterSpells() !== undefined) return;

    const spellLevels = Object.keys(character().spells_slots);

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, props.character.provider, appState.activePageParams.id);
    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      props.character.provider,
      spellLevels.length === 0 ? 0 : Math.max(...spellLevels)
    );

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells);
        });
      }
    );
  });

  // only sends request
  const refreshCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    if (result.errors === undefined) await props.onReloadCharacter();
    return result;
  }

  // additional data change for items
  const reloadCharacterItems = async () => {
    const characterItemsData = await fetchCharacterItemsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    setCharacterItems(characterItemsData.items);
  }

  const buyItem = async (item) => {
    const result = await createCharacterItemRequest(appState.accessToken, 'dnd5', props.character.id, { item_id: item.id });

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind.includes('weapon')) props.onReloadCharacter();
        reloadCharacterItems();
        renderNotice(t('alerts.itemIsAdded'));
      });
    }
    return result;
  }

  const updateCharacterItem = async (item, payload) => {
    const result = await updateCharacterItemRequest(appState.accessToken, 'dnd5', props.character.id, item.id, payload);

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
    const result = await removeCharacterItemRequest(appState.accessToken, 'dnd5', props.character.id, item.id);

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') reloadCharacterItems();
        else setCharacterItems(characterItems().filter((element) => element !== item));
      });
    }
  }

  // additional data change for spells
  const reloadCharacterSpells = async () => {
    const characterSpellsData = await fetchCharacterSpellsRequest(appState.accessToken, props.character.provider, appState.activePageParams.id);
    setCharacterSpells(characterSpellsData.spells);
  }

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, { spell_id: spellId, target_spell_class: targetSpellClass });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId);
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const prepareSpell = async (spellId) => {
    const result = await updateCharacterSpell(spellId, { 'ready_to_use': 1 });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const disableSpell = async (spellId) => {
    const result = await updateCharacterSpell(spellId, { 'ready_to_use': 0 });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const updateSpellNotes = async (spellId, notes) => {
    const result = await updateCharacterSpell(spellId, { 'notes': notes });
    if (result.errors === undefined) reloadCharacterSpells();
    return result;
  }

  const updateCharacterSpell = async (spellId, payload) => {
    return await updateCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId, payload);
  }

  // shared data
  const spendEnergy = async (event, feature) => {
    event.stopPropagation();

    let payload;
    const currentValue = character().energy[feature.slug];

    if (currentValue === feature.limit) return;
    if (currentValue) {
      payload = { ...energyData(), [feature.slug]: currentValue + 1 };
    } else {
      payload = { ...energyData(), [feature.slug]: 1 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { energy: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ energy: payload });
    else renderAlerts(result.errors);
  }

  const restoreEnergy = async (event, feature) => {
    event.stopPropagation();

    let payload;
    const currentValue = character().energy[feature.slug];

    if (currentValue === 0) return;
    if (currentValue) {
      payload = { ...character().energy, [feature.slug]: currentValue - 1 };
    } else {
      payload = { ...character().energy, [feature.slug]: 0 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { energy: payload }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ energy: payload });
    else renderAlerts(result.errors);
  }

  const spendSpellSlot = async (level) => {
    let newValue;
    if (spentSpellSlots()[level]) {
      newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] + 1 };
    } else {
      newValue = { ...spentSpellSlots(), [level]: 1 };
    }

    const result = await refreshCharacter({ spent_spell_slots: newValue });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const freeSpellSlot = async (level) => {
    const newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] - 1 };

    const result = await refreshCharacter({ spent_spell_slots: newValue });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  // memos
  const knownSpellIds = createMemo(() => {
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ spell_id }) => spell_id);
  });

  return (
    <>
      <CharacterNavigation
        tabsList={['abilities', 'combat', 'rest', 'equipment', 'spells', 'notes', 'professions', 'classLevels', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'abilities'}>
            <Dnd5Abilities
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <Dnd5Combat
              character={character()}
              energyData={energyData()}
              onSpendEnergy={spendEnergy}
              onRestoreEnergy={restoreEnergy}
              onReloadCharacter={updateCharacter}
              onRefreshCharacter={refreshCharacter}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'rest'}>
            <Dnd5Rest
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <Show
              when={!activeItemsTab()}
              fallback={
                <Dnd5Items
                  items={items()}
                  onBuyItem={buyItem}
                  onNavigatoToEquipment={() => setActiveItemsTab(false)}
                />
              }
            >
              <Dnd5Equipment
                character={character()}
                characterItems={characterItems()}
                onNavigatoToItems={() => setActiveItemsTab(true)}
                onUpdateCharacterItem={updateCharacterItem}
                onRefreshCharacter={refreshCharacter}
                onRemoveCharacterItem={removeCharacterItem}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Show>
          </Match>
          <Match when={activeTab() === 'spells'}>
            <Switch>
              <Match when={spellClassesList().length === 0}>
                <div class="p-4 flex white-box">
                  <p>{t('character.no_magic')}</p>
                </div>
              </Match>
              <Match when={spells() === undefined || characterSpells() === undefined}>
                <></>
              </Match>
              <Match when={activeSpellsTab()}>
                <Dnd5Spells
                  character={character()}
                  spells={spells()}
                  characterSpells={characterSpells()}
                  initialSpellClassesList={spellClassesList()}
                  knownSpellIds={knownSpellIds()}
                  onLearnSpell={learnSpell}
                  onForgetSpell={forgetSpell}
                  onNavigatoToSpellbook={() => setActiveSpellsTab(false)}
                />
              </Match>
              <Match when={!activeSpellsTab()}>
                <Dnd5Spellbook
                  character={character()}
                  spells={spells()}
                  characterSpells={characterSpells()}
                  initialSpellClassesList={spellClassesList()}
                  spentSpellSlots={spentSpellSlots()}
                  onSpendSpellSlot={spendSpellSlot}
                  onFreeSpellSlot={freeSpellSlot}
                  onNavigatoToSpells={() => setActiveSpellsTab(true)}
                  onUpdateSpellNotes={updateSpellNotes}
                  onPrepareSpell={prepareSpell}
                  onDisableSpell={disableSpell}
                />
              </Match>
            </Switch>
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Notes />
          </Match>
          <Match when={activeTab() === 'classLevels'}>
            <Dnd5ClassLevels
              character={character()}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'professions' && items() !== undefined}>
            <Dnd5Professions
              character={character()}
              items={items()}
              onRefreshCharacter={refreshCharacter}
              onReloadCharacter={updateCharacter}
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
