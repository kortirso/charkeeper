import { createSignal, createEffect, Switch, Match, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5Equipment, Dnd5Items, Dnd5Notes
} from '../../../components';
import { createModal, PageHeader } from '../../molecules';

import { Hamburger } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';

import { fetchCharacterItemsRequest } from '../../../requests/fetchCharacterItemsRequest';
import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';
import { updateCharacterItemRequest } from '../../../requests/updateCharacterItemRequest';
import { removeCharacterItemRequest } from '../../../requests/removeCharacterItemRequest';
import { fetchItemsRequest } from '../../../requests/fetchItemsRequest';
import { createCharacterItemRequest } from '../../../requests/createCharacterItemRequest';
import { createCharacterRestRequest } from '../../../requests/createCharacterRestRequest';

export const Dnd2024 = (props) => {
  const decoratedData = () => props.decoratedData;

  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');
  const [activeItemsTab, setActiveItemsTab] = createSignal(false);

  // page data
  const [items, setItems] = createSignal(undefined);
  const [characterItems, setCharacterItems] = createSignal(undefined);

  // shared state
  const [spentHitDiceData, setSpentHitDiceData] = createSignal(decoratedData().spent_hit_dice);
  const [healthData, setHealthData] = createSignal(decoratedData().health);
  const [energyData, setEnergyData] = createSignal(decoratedData().energy);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

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

  // only sends request
  const refreshCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, 'dnd2024', props.characterId, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, 'dnd2024', props.characterId, { character: payload });

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
    const result = await createCharacterRestRequest(appState.accessToken, 'dnd2024', props.characterId, payload);
    if (result.errors === undefined) {
      const decoratedData = await props.onReloadCharacter();

      batch(() => {
        setSpentHitDiceData(decoratedData.spent_hit_dice);
        setHealthData(decoratedData.health);
        setEnergyData(decoratedData.energy);
      });

      renderNotice(t('alerts.restIsFinished'));
    }
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
              {t(`dnd2024.species.${decoratedData().species}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`dnd2024.classes.${item}`)} ${value}`).join(' * ')}
            </p>
          </PageHeader>
        }
      >
        <Match when={activeItemsTab()}>
          <PageHeader leftContent={<p class="cursor-pointer" onClick={() => setActiveItemsTab(false)}>{t('back')}</p>}>
            <p>{t('itemsPage.title')}</p>
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
          <Match when={activeTab() === 'notes'}>
            <Dnd5Notes />
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
        <p class="character-tab-select" onClick={() => changeTab('notes')}>{t('character.notes')}</p>
      </Modal>
    </>
  );
}
