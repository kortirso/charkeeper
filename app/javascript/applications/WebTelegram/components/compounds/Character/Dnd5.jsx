import { createSignal, Switch, Match, batch, Show, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5ClassLevels, Dnd5Professions, Dnd5Equipment, Dnd5Items,
  Dnd5Spellbook, Dnd5Spells, Dnd5Notes
} from '../../../components';
import { createModal, PageHeader } from '../../molecules';

import { Hamburger } from '../../../assets';
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
import { createCharacterRestRequest } from '../../../requests/createCharacterRestRequest';

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

  // shared state
  const [spentHitDiceData, setSpentHitDiceData] = createSignal(decoratedData().spent_hit_dice);
  const [healthData, setHealthData] = createSignal(decoratedData().health);
  const [energyData, setEnergyData] = createSignal(decoratedData().energy);
  const [spentSpellSlots, setSpentSpellSlots] = createSignal(decoratedData().spent_spell_slots);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
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

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, props.provider, appState.activePageParams.id);
    const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, props.provider);

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
    const result = await updateCharacterRequest(appState.accessToken, props.provider, props.characterId, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.provider, props.characterId, { character: payload });

    if (result.errors === undefined) return await props.onReloadCharacter();
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

  const restCharacter = async (payload) => {
    const result = await createCharacterRestRequest(appState.accessToken, props.provider, props.characterId, payload);
    if (result.errors === undefined) {
      const decoratedData = await props.onReloadCharacter();

      batch(() => {
        setSpentHitDiceData(decoratedData.spent_hit_dice);
        setHealthData(decoratedData.health);
        setEnergyData(decoratedData.energy);
        setSpentSpellSlots(decoratedData.spent_spell_slots);
      });

      renderNotice(t('alerts.restIsFinished'));
    }
  }

  // additional data change for spells
  const reloadCharacterSpells = async () => {
    const characterSpellsData = await fetchCharacterSpellsRequest(appState.accessToken, props.provider, appState.activePageParams.id);
    setCharacterSpells(characterSpellsData.spells);
  }

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(appState.accessToken, props.provider, props.characterId, { spell_id: spellId, target_spell_class: targetSpellClass });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, props.provider, props.characterId, spellId);
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
    const result = await updateCharacterSpellRequest(appState.accessToken, props.provider, props.characterId, spellId, payload);
    return result;
  }

  // shared data
  const spendDice = async (dice, limit) => {
    let newValue;
    if (spentHitDiceData()[dice] && spentHitDiceData()[dice] < limit) {
      newValue = { ...spentHitDiceData(), [dice]: spentHitDiceData()[dice] + 1 };
    } else {
      newValue = { ...spentHitDiceData(), [dice]: 1 };
    }

    const result = await refreshCharacter({ spent_hit_dice: newValue });
    if (result.errors === undefined) setSpentHitDiceData(newValue);
  }

  const restoreDice = async (dice) => {
    let newValue;
    if (spentHitDiceData()[dice] && spentHitDiceData()[dice] > 0) {
      newValue = { ...spentHitDiceData(), [dice]: spentHitDiceData()[dice] - 1 };
    } else {
      newValue = { ...spentHitDiceData(), [dice]: 0 };
    }

    const result = await refreshCharacter({ spent_hit_dice: newValue });
    if (result.errors === undefined) setSpentHitDiceData(newValue);
  }

  const spendEnergy = async (event, slug, limit) => {
    event.stopPropagation();

    let newValue;
    if (energyData()[slug] && energyData()[slug] < limit) {
      newValue = { ...energyData(), [slug]: energyData()[slug] + 1 };
    } else {
      newValue = { ...energyData(), [slug]: 1 };
    }

    const result = await refreshCharacter({ energy: newValue });
    if (result.errors === undefined) setEnergyData(newValue);
  }

  const restoreEnergy = async (event, slug) => {
    event.stopPropagation();

    let newValue;
    if (energyData()[slug] && energyData()[slug] > 0) {
      newValue = { ...energyData(), [slug]: energyData()[slug] - 1 };
    } else {
      newValue = { ...energyData(), [slug]: 0 };
    }

    const result = await refreshCharacter({ energy: newValue });
    if (result.errors === undefined) setEnergyData(newValue);
  }

  const makeHeal = async (damageHealValue) => {
    const missingHealth = healthData().max - healthData().current;

    let newValue;
    if (damageHealValue >= missingHealth) newValue = { ...healthData(), current: healthData().max }
    else newValue = { ...healthData(), current: healthData().current + damageHealValue }

    const result = await refreshCharacter({ health: newValue });
    if (result.errors === undefined) setHealthData(newValue);
  }

  const dealDamage = async (damageHealValue) => {
    const damageToTempHealth = damageHealValue >= healthData().temp ? healthData().temp : damageHealValue;
    const damageToHealth = damageHealValue - damageToTempHealth;

    let newValue = { ...healthData(), current: healthData().current - damageToHealth, temp: healthData().temp - damageToTempHealth }
    const result = await refreshCharacter({ health: newValue });
    if (result.errors === undefined) setHealthData(newValue);
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
            <Switch>
              <Match when={props.provider === 'dnd5'}>
                <p class="text-sm">
                  {decoratedData().subrace ? t(`dnd5.subraces.${decoratedData().race}.${decoratedData().subrace}`) : t(`dnd5.races.${decoratedData().race}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`dnd5.classes.${item}`)} ${value}`).join(' * ')}
                </p>
              </Match>
              <Match when={props.provider === 'dnd2024'}>
                <p class="text-sm">
                  {t(`dnd2024.species.${decoratedData().species}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`dnd2024.classes.${item}`)} ${value}`).join(' * ')}
                </p>
              </Match>
            </Switch>
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
              skills={props.decoratedData.skills}
              modifiers={props.decoratedData.modifiers}
              saveDc={props.decoratedData.save_dc}
              proficiencyBonus={props.decoratedData.proficiency_bonus}
              hitDice={props.decoratedData.hit_dice}
              spentHitDiceData={spentHitDiceData()}
              onSpendDice={spendDice}
              onRestoreDice={restoreDice}
              onReloadCharacter={updateCharacter}
              onRefreshCharacter={refreshCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <Dnd5Combat
              combat={props.decoratedData.combat}
              attacks={props.decoratedData.attacks}
              features={props.decoratedData.features}
              selectedFeatures={props.decoratedData.selected_features}
              skills={props.decoratedData.skills}
              initialConditions={props.decoratedData.conditions}
              healthData={healthData()}
              energyData={energyData()}
              onSpendEnergy={spendEnergy}
              onRestoreEnergy={restoreEnergy}
              onMakeHeal={makeHeal}
              onDealDamage={dealDamage}
              onSetHealthData={setHealthData}
              onReloadCharacter={updateCharacter}
              onRefreshCharacter={refreshCharacter}
              onRestCharacter={restCharacter}
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
                  provider={props.provider}
                  spells={spells()}
                  characterSpells={characterSpells()}
                  staticCharacterSpells={props.decoratedData.static_spells} // eslint-disable-line solid/reactivity
                  spellSlots={props.decoratedData.spells_slots}
                  initialSpellClassesList={spellClassesList()}
                  spellClasses={props.decoratedData.spell_classes}
                  spentSpellSlots={spentSpellSlots()}
                  onSpendSpellSlot={spendSpellSlot}
                  onFreeSpellSlot={freeSpellSlot}
                  onNavigatoToSpells={() => setActiveSpellsTab(true)}
                  onRefreshCharacter={refreshCharacter}
                  onUpdateCharacterSpell={updateCharacterSpell}
                  onPrepareSpell={prepareSpell}
                  onDisableSpell={disableSpell}
                />
              </Match>
            </Switch>
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Dnd5Notes />
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
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
        <p class="character-tab-select" onClick={() => changeTab('spells')}>{t('character.spells')}</p>
        <p class="character-tab-select" onClick={() => changeTab('notes')}>{t('character.notes')}</p>
        <Show when={props.provider === 'dnd5'}>
          <p class="character-tab-select" onClick={() => changeTab('professions')}>{t('character.professions')}</p>
          <p class="character-tab-select" onClick={() => changeTab('classLevels')}>{t('character.classLevels')}</p>
        </Show>
      </Modal>
    </>
  );
}
