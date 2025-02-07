import { createSignal, Switch, Match, batch, Show, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5ClassLevels, Dnd5Professions, Dnd5Equipment, Dnd5Items,
  Dnd5Spellbook, Dnd5Spells, Dnd5Features
} from '../../../../components';
import { createModal, PageHeader } from '../../../molecules';
import { Hamburger } from '../../../../assets';

import { useAppState, useAppLocale } from '../../../../context';

import { fetchCharacterFeaturesRequest } from '../../../../requests/fetchCharacterFeaturesRequest';
import { fetchCharacterItemsRequest } from '../../../../requests/fetchCharacterItemsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { updateCharacterItemRequest } from '../../../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../../../requests/removeCharacterItemRequest';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchItemsRequest } from '../../../../requests/fetchItemsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { createCharacterItemRequest } from '../../../../requests/createCharacterItemRequest';

export const Dnd5 = (props) => {
  const decoratedData = () => props.decoratedData;
  const spellClassesList = () => Object.keys(decoratedData().spell_classes);

  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');
  const [activeItemsTab, setActiveItemsTab] = createSignal(false);
  const [activeSpellsTab, setActiveSpellsTab] = createSignal(false);

  // page data
  const [items, setItems] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);  
  const [features, setFeatures] = createSignal(undefined);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
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

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, 'dnd5');

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells);
        });
      }
    );
  });

  createEffect(() => {
    if (activeTab() !== 'features') return;
    if (features() !== undefined) return;

    const fetchCharacterFeatures = async () => await fetchCharacterFeaturesRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);

    Promise.all([fetchCharacterFeatures()]).then(
      ([characterFeaturesData]) => {
        setFeatures(characterFeaturesData.features);
      }
    );
  });

  // only sends request
  const refreshCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: payload });

    if (result.errors === undefined) props.onReloadCharacter();
    return result;
  }

  // additional data change for items
  const reloadCharacterItems = async () => {
    const characterItemsData = await fetchCharacterItemsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    setCharacterItems(characterItemsData.items);
  }

  const buyItem = async (item) => {
    const result = await createCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, { item_id: item.id });

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind.includes('weapon')) props.onReloadCharacter();
        reloadCharacterItems();
      });
    }
    return result;
  }

  const updateCharacterItem = async (item, payload) => {
    const result = await updateCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, item.id, payload);

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
    const result = await removeCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, item.id);

    if (result.errors === undefined) {
      batch(() => {
        if (item.kind !== 'item') reloadCharacterItems();
        else setCharacterItems(characterItems().filter((element) => element !== item));
      });
    }
  }

  // additional data change for spells
  const reloadCharacterSpells = async () => {
    const characterSpellsData = await fetchCharacterSpellsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    setCharacterSpells(characterSpellsData.spells);
  }

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(appState.accessToken, 'dnd5', props.characterId, { spell_id: spellId, target_spell_class: targetSpellClass });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, 'dnd5', props.characterId, spellId);
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

  const updateCharacterSpell = async (spellId, payload) => {
    const result = await updateCharacterSpellRequest(appState.accessToken, 'dnd5', props.characterId, spellId, payload);
    return result;
  }

  // memos
  const knownSpellIds = createMemo(() => {
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ spell_id }) => spell_id);
  });

  // user actions
  const changeTab = (value) => {
    batch(() => {
      setActiveTab(value);
      closeModal();
    });
  }

  return (
    <>
      <Switch
        fallback={
          <PageHeader rightContent={<Hamburger onClick={openModal} />}>
            <p>{props.name}</p>
            <p class="text-sm">
              {decoratedData().subrace ? t(`subraces.${decoratedData().race}.${decoratedData().subrace}`) : t(`races.${decoratedData().race}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`classes.${item}`)} ${value}`).join(' * ')}
            </p>
          </PageHeader>
        }
      >
        <Match when={activeItemsTab()}>
          <PageHeader leftContent={<p class="cursor-pointer" onClick={() => setActiveItemsTab(false)}>{t('back')}</p>}>
            <p>{t('itemsPage.title')}</p>
          </PageHeader>
        </Match>
        <Match when={activeSpellsTab()}>
          <PageHeader leftContent={<p class="cursor-pointer" onClick={() => setActiveSpellsTab(false)}>{t('back')}</p>}>
            <p>{t('spellsPage.title')}</p>
          </PageHeader>
        </Match>
      </Switch>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'abilities'}>
            <Dnd5Abilities
              initialAbilities={props.decoratedData.abilities}
              initialSkills={props.decoratedData.skills}
              modifiers={props.decoratedData.modifiers}
              saveDc={props.decoratedData.save_dc}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <Dnd5Combat
              initialHealth={props.decoratedData.health}
              initialEnergy={props.decoratedData.energy}
              combat={props.decoratedData.combat}
              attacks={props.decoratedData.attacks}
              classFeatures={props.decoratedData.class_features}
              initialConditions={props.decoratedData.conditions}
              onRefreshCharacter={refreshCharacter}
            />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <Show
              when={!activeItemsTab()}
              fallback={
                <Dnd5Items
                  items={items()}
                  onBuyItem={buyItem}
                />
              }
            >
              <Dnd5Equipment
                initialCoins={props.decoratedData.coins}
                characterItems={characterItems()}
                load={props.decoratedData.load}
                onNavigatoToItems={() => setActiveItemsTab(true)}
                onUpdateCharacterItem={updateCharacterItem}
                onRefreshCharacter={refreshCharacter}
                onRemoveCharacterItem={removeCharacterItem}
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
                  spells={spells()}
                  characterSpells={characterSpells()}
                  initialSpellClassesList={spellClassesList()}
                  spellClasses={props.decoratedData.spell_classes}
                  knownSpellIds={knownSpellIds()}
                  onLearnSpell={learnSpell}
                  onForgetSpell={forgetSpell}
                />
              </Match>
              <Match when={!activeSpellsTab()}>
                <Dnd5Spellbook
                  initialSpentSpellSlots={props.decoratedData.spent_spell_slots}
                  spells={spells()}
                  characterSpells={characterSpells()}
                  staticCharacterSpells={props.decoratedData.static_spells} // eslint-disable-line solid/reactivity
                  spellSlots={props.decoratedData.spells_slots}
                  initialSpellClassesList={spellClassesList()}
                  spellClasses={props.decoratedData.spell_classes}
                  onNavigatoToSpells={() => setActiveSpellsTab(true)}
                  onRefreshCharacter={refreshCharacter}
                  onUpdateCharacterSpell={updateCharacterSpell}
                  onPrepareSpell={prepareSpell}
                  onDisableSpell={disableSpell}
                />
              </Match>
            </Switch>
          </Match>
          <Match when={activeTab() === 'classLevels'}>
            <Dnd5ClassLevels
              initialClasses={props.decoratedData.classes}
              initialSubclasses={props.decoratedData.subclasses}
              mainClass={props.decoratedData.main_class}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'professions' && items() !== undefined}>
            <Dnd5Professions
              initialTools={props.decoratedData.tools}
              initialMusic={props.decoratedData.music}
              initialLanguages={props.decoratedData.languages}
              weaponCoreSkills={props.decoratedData.weapon_core_skills}
              weaponSkills={props.decoratedData.weapon_skills}
              armorSkills={props.decoratedData.armor_proficiency}
              items={items()}
              onRefreshCharacter={refreshCharacter}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'features'}>
            <Dnd5Features
              initialSelectedFeatures={props.decoratedData.selected_features}
              features={features()}
              skills={props.decoratedData.skills}
              onReloadCharacter={updateCharacter}
            />
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
        <p class="character-tab-select" onClick={() => changeTab('spells')}>{t('character.spells')}</p>
        <p class="character-tab-select" onClick={() => changeTab('features')}>{t('character.features')}</p>
        <p class="character-tab-select" onClick={() => changeTab('professions')}>{t('character.professions')}</p>
        <p class="character-tab-select" onClick={() => changeTab('classLevels')}>{t('character.classLevels')}</p>
      </Modal>
    </>
  );
}
