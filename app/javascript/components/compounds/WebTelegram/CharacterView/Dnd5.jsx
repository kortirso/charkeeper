import { createSignal, Switch, Match, batch, For, Show, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Checkbox, Select, Toggle } from '../../../atoms';

import { useAppState, useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

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

const CLASSES_LEARN_SPELLS = ['bard', 'ranger', 'sorcerer', 'warlock', 'wizard'];
const CLASSES_PREPARE_SPELLS = ['cleric', 'druid', 'paladin', 'wizard'];

export const Dnd5 = (props) => {
  const decoratedData = () => props.decoratedData;
  const spellClasses = () => Object.keys(decoratedData().spell_classes);

  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');
  const [characterItems, setCharacterItems] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [features, setFeatures] = createSignal(undefined);
  const [modalOpenMode, setModalOpenMode] = createSignal(null);
  const [activeSpellClass, setActiveSpellClass] = createSignal(spellClasses().length == 0 ? 'all' : spellClasses()[0]);
  const [preparedSpellFilter, setPreparedSpellFilter] = createSignal(true);
  const [availableSpellFilter, setAvailableSpellFilter] = createSignal(true);

  // forms for change user data
  const [abilitiesFormData, setAbilitiesFormData] = createSignal(props.decoratedData.abilities);
  const [healthFormData, setHealthFormData] = createSignal(props.decoratedData.combat.health);
  const [skillsFormData, setSkillsFormData] = createSignal(props.decoratedData.skills.filter((item) => item.selected).map((item) => item.name));
  const [classesFormData, setClassesFormData] = createSignal(props.decoratedData.classes);
  const [spentSpellSlots, setSpentSpellSlots] = createSignal(props.decoratedData.spent_spell_slots);
  const [changingCoins, setChangingCoins] = createSignal(props.decoratedData.coins);
  const [changingItem, setChangingItem] = createSignal(undefined);
  const [subclasses, setSubclasses] = createSignal(props.decoratedData.subclasses)
  const [featuresFormData, setFeaturesFormData] = createSignal(props.decoratedData.selected_features);
  const [energyFormData, setEnergyFormData] = createSignal(props.decoratedData.energy);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

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
    if (activeTab() !== 'spells') return;
    if (spellClasses().length === 0) return;
    if (characterSpells() !== undefined) return;

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);

    Promise.all([fetchCharacterSpells()]).then(
      ([characterSpellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setActiveSpellClass(spellClasses()[0]);
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

  createEffect(() => {
    if (activeTab() !== 'items') return;
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, 'dnd5');

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        setItems(itemsData.items);
      }
    );
  });

  createEffect(() => {
    if (activeTab() !== 'spells') return;
    if (spellClasses().length === 0) return;
    if (spells() !== undefined) return;

    const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, 'dnd5');

    Promise.all([fetchSpells()]).then(
      ([spellsData]) => {
        setSpells(spellsData.spells);
      }
    );
  });

  // additional data change
  const refreshCharacterItems = (item, payload) => {
    const result = characterItems().slice();
    result[characterItems().indexOf(item)] = { ...item, ready_to_use: payload.character_item.ready_to_use };

    setCharacterItems(result);
  }

  const removeCharacterItemFromList = async (item) => {
    setCharacterItems(characterItems().filter((element) => element !== item));
  }

  const reloadCharacterItems = async () => {
    const characterItemsData = await fetchCharacterItemsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    setCharacterItems(characterItemsData.items);
  }

  const reloadCharacterSpells = async () => {
    const characterSpellsData = await fetchCharacterSpellsRequest(appState.accessToken, 'dnd5', appState.activePageParams.id);
    setCharacterSpells(characterSpellsData.spells);
  }

  // memos
  const filteredSpells = createMemo(() => {
    if (characterSpells() === undefined) return [];

    const list = decoratedData().static_spells;
    const result = characterSpells().filter((item) => {
      if (activeSpellClass() !== 'all' && item.prepared_by !== activeSpellClass()) return false;
      if (preparedSpellFilter()) return item.ready_to_use;
      if (list.includes(item.slug)) return false;
      return true;
    });
    return Object.groupBy(result, ({ level }) => level);
  });

  const staticSpells = createMemo(() => {
    if (spells() === undefined) return [];
    if (decoratedData().static_spells.length === 0) return [];

    const list = decoratedData().static_spells;
    const result = spells().filter((item) => list.includes(item.slug));
    return Object.groupBy(result, ({ level }) => level);
  });

  const filteredSpellsList = createMemo(() => {
    if (spells() === undefined) return [];

    const maxSpellLevel = decoratedData().spell_classes[activeSpellClass()].max_spell_level;
    const result = spells().filter((item) => {
      if (item.level > maxSpellLevel) return false;
      if (!availableSpellFilter()) return true;

      return item.available_for.includes(activeSpellClass());
    });

    return Object.entries(Object.groupBy(result, ({ level }) => level));
  })

  const calculateCurrentLoad = createMemo(() => {
    if (characterItems() === undefined) return 0;

    return characterItems().reduce((acc, item) => acc + item.quantity * item.weight, 0);
  });

  const knownSpellIds = createMemo(() => {
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ spell_id }) => spell_id);
  });

  // user actions
  const openModalMode = (value) => {
    batch(() => {
      setModalOpenMode(value);
      openModal();
    });
  }

  const changeTab = (value) => {
    batch(() => {
      setActiveTab(value);
      setModalOpenMode(null);
      closeModal();
    });
  }

  const changeAbility = (ability, direction) => {
    const newValue = direction === 'up' ? (abilitiesFormData()[ability] + 1) : (abilitiesFormData()[ability] - 1);
    setAbilitiesFormData({ ...abilitiesFormData(), [ability]: newValue });
  }

  const changeHealth = (health, direction) => {
    const newValue = direction === 'up' ? (healthFormData()[health] + 1) : (healthFormData()[health] - 1);
    setHealthFormData({ ...healthFormData(), [health]: newValue });
  }

  const changeClass = (class_name, direction) => {
    const newValue = direction === 'up' ? (classesFormData()[class_name] + 1) : (classesFormData()[class_name] - 1);
    setClassesFormData({ ...classesFormData(), [class_name]: newValue });
  }

  const addOrRemoveClass = (class_name) => {
    if (classesFormData()[class_name]) {
      const result = Object.keys(classesFormData())
        .filter(item => item !== class_name)
        .reduce((acc, item) =>
          {
            acc[item] = classesFormData()[item];
            return acc;
          }, {}
        );

      setClassesFormData(result);
    } else {
      setClassesFormData({ ...classesFormData(), [class_name]: 1 });
    }
  }

  const changeSkill = (slug) => {
    if (skillsFormData().includes(slug)) {
      setSkillsFormData(skillsFormData().filter((item) => item !== slug));
    } else {
      setSkillsFormData(skillsFormData().concat(slug));
    }
  }

  const spendSpellSlot = async (level) => {
    let newValue;
    if (spentSpellSlots()[level]) {
      newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] + 1 };
    } else {
      newValue = { ...spentSpellSlots(), [level]: 1 };
    }

    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: { spent_spell_slots: newValue } });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const freeSpellSlot = async (level) => {
    const newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] - 1 };
    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: { spent_spell_slots: newValue } });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const updateCoins = async () => {
    await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: { coins: changingCoins() } });

    batch(() => {
      setModalOpenMode(null);
      closeModal();
    });
  }

  const spendEnergy = async (event, slug) => {
    event.stopPropagation();

    let newValue;
    if (energyFormData()[slug]) {
      newValue = { ...energyFormData(), [slug]: energyFormData()[slug] + 1 };
    } else {
      newValue = { ...energyFormData(), [slug]: 1 };
    }

    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: { energy: newValue } });
    if (result.errors === undefined) setEnergyFormData(newValue);
  }

  const restoreEnergy = async (event, slug) => {
    event.stopPropagation();

    let newValue;
    if (energyFormData()[slug]) {
      newValue = { ...energyFormData(), [slug]: energyFormData()[slug] - 1 };
    } else {
      newValue = { ...energyFormData(), [slug]: 0 };
    }

    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: { energy: newValue } });
    if (result.errors === undefined) setEnergyFormData(newValue);
  }

  const changeQuantity = (item) => {
    batch(() => {
      setChangingItem(item);
      openModalMode('changeQuantity');
    });
  }

  const toggleFeatureOption = (feature, option) => {
    const selectedOptions = featuresFormData()[feature.slug];

    if (selectedOptions) {
      let newOptions;
      if (selectedOptions.includes(option)) {
        newOptions = selectedOptions.filter((item) => item !== option);
      } else {
        newOptions = selectedOptions.concat(option);
      }
      setFeaturesFormData({ ...featuresFormData(), [feature.slug]: newOptions });
    } else {
      setFeaturesFormData({ ...featuresFormData(), [feature.slug]: [option] });
    }
  }

  const updateCharacterAbilities = () => updateCharacter({ abilities: abilitiesFormData() });
  const updateCharacterHealth = () => updateCharacter({ health: healthFormData() });
  const updateCharacterSkills = () => updateCharacter({ selected_skills: skillsFormData() });
  const updateCharacterClasses = () => updateCharacter({ classes: classesFormData(), subclasses: subclasses() });
  const updateCharacterFeatures = () => updateCharacter({ selected_features: featuresFormData() });

  // sending requests
  const learnSpell = async (spellId) => {
    await createCharacterSpellRequest(
      appState.accessToken,
      'dnd5',
      props.characterId,
      { spell_id: spellId, target_spell_class: activeSpellClass() }
    );
    reloadCharacterSpells();
  }

  const forgetSpell = async (spellId) => {
    await removeCharacterSpellRequest(
      appState.accessToken,
      'dnd5',
      props.characterId,
      spellId
    );
    reloadCharacterSpells();
  }

  const prepareSpell = async (spellId) => {
    await updateCharacterSpellRequest(
      appState.accessToken,
      'dnd5',
      props.characterId,
      spellId,
      { 'ready_to_use': 1 }
    );
    reloadCharacterSpells();
  }

  const disableSpell = async (spellId) => {
    await updateCharacterSpellRequest(
      appState.accessToken,
      'dnd5',
      props.characterId,
      spellId,
      { 'ready_to_use': 0 }
    );
    reloadCharacterSpells();
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, 'dnd5', props.characterId, { character: payload });

    if (result.errors === undefined) {
      batch(() => {
        setModalOpenMode(null);
        closeModal();
      });
      props.onReloadCharacter();
    }
  }

  const buyItem = async (item) => {
    const result = await createCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, { item_id: item.id });

    if (result.errors === undefined) {
      reloadCharacterItems();
      if (item.kind.includes('weapon')) props.onReloadCharacter();
    }
  }

  const updateCharacterItem = async (item, payload) => {
    const result = await updateCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, item.id, payload);

    if (result.errors === undefined) {
      if (item.kind !== 'item') reloadCharacterItems();
      else refreshCharacterItems(item, payload);
    }
  }

  const updateCharacterItemQuantity = async () => {
    const result = await updateCharacterItemRequest(
      appState.accessToken,
      'dnd5',
      props.characterId,
      changingItem().id,
      { character_item: { quantity: changingItem().quantity } }
    );

    if (result.errors === undefined) {
      batch(() => {
        setModalOpenMode(null);
        closeModal();
      });
      reloadCharacterItems();
      if (changingItem().kind.includes('weapon')) props.onReloadCharacter();
    }
  }

  const removeCharacterItem = async (item) => {
    const result = await removeCharacterItemRequest(appState.accessToken, 'dnd5', props.characterId, item.id);

    if (result.errors === undefined) {
      if (item.kind !== 'item') reloadCharacterItems();
      else removeCharacterItemFromList(item);
    }
  }

  // rendering
  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 white-box mb-2">
        <h2 class="text-lg mb-2">{title}</h2>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-center">{t('attacks.bonus')}</td>
              <td class="text-center">{t('attacks.damage')}</td>
              <td class="text-center">{t('attacks.distance')}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) =>
                <tr>
                  <td class="py-1">
                    <p>{attack.name}</p>
                    <Show when={attack.tooltips.length > 0}>
                      <p class="text-xs">
                        {attack.tooltips.map((item) => t(`attack.tooltips.${item}`)).join(', ')}
                      </p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
                  <td class="py-1 text-center">
                    <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                    <p class="text-xs">{t(`damage.${attack.damage_type}`)}</p>
                  </td>
                  <td class="py-1 text-center">
                    <Show when={attack.melee_distance}><p>{attack.melee_distance}</p></Show>
                    <Show when={attack.range_distance}><p>{attack.range_distance}</p></Show>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  const renderItemsBox = (title, items) => (
    <div class="p-4 white-box mb-2">
      <h2 class="text-lg">{title}</h2>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <td class="text-center text-nowrap px-2">{t('equipment.quantity')}</td>
            <td class="text-center text-nowrap px-2">{t('equipment.cost')}</td>
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p>{item.name}</p>
                </td>
                <td
                  class="py-1 text-center cursor-pointer"
                  onClick={() => changeQuantity(item)}
                >{item.quantity}</td>
                <td class="py-1 text-center">{item.quantity * item.price / 100}</td>
                <td>
                  <Switch>
                    <Match when={item.ready_to_use}>
                      <span
                        class="text-sm cursor-pointer"
                        onClick={() => updateCharacterItem(item, { character_item: { ready_to_use: false } })}
                      >Pack</span>
                    </Match>
                    <Match when={!item.ready_to_use}>
                      <span
                        class="text-sm cursor-pointer"
                        onClick={() => updateCharacterItem(item, { character_item: { ready_to_use: true } })}
                      >Unpack</span>
                    </Match>
                  </Switch>
                  <span
                    class="ml-2 text-sm cursor-pointer"
                    onClick={() => removeCharacterItem(item)}
                  >X</span>
                </td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  );

  const renderItems = (title, items) => (
    <Toggle title={title}>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <td class="text-center px-2">{t('equipment.weight')}</td>
            <td class="text-center text-nowrap px-2">{t('equipment.cost')}</td>
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p>{item.name}</p>
                </td>
                <td class="py-1 text-center">{item.data.weight}</td>
                <td class="py-1 text-center">{item.data.price / 100}</td>
                <td
                  class="cursor-pointer"
                  onClick={() => buyItem(item)}
                >+</td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </Toggle>
  );

  const renderClassFeatureTitle = (class_feature) => {
    if (class_feature.limit === undefined) return class_feature.title;

    return (
      <div class="flex items-center">
        <p class="flex-1">{class_feature.title}</p>
        <div class="flex items-center">
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => energyFormData()[class_feature.slug] !== class_feature.limit ? spendEnergy(event, class_feature.slug) : event.stopPropagation()}
          >-</button>
          <p class="w-12 text-center">{class_feature.limit - (energyFormData()[class_feature.slug] || 0)} / {class_feature.limit}</p>
          <button
            class="py-1 px-2 border border-gray-200 rounded flex justify-center items-center"
            onClick={(event) => (energyFormData()[class_feature.slug] || 0) > 0 ? restoreEnergy(event, class_feature.slug) : event.stopPropagation()}
          >+</button>
        </div>
      </div>
    );
  }

  return (
    <div class="h-full flex flex-col">
      <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray-200">
        <div class="w-10" />
        <div class="flex-1 flex flex-col items-center">
          <p>{props.name}</p>
          <p class="text-sm">
            {decoratedData().subrace ? t(`subraces.${decoratedData().race}.${decoratedData().subrace}`) : t(`races.${decoratedData().race}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`classes.${item}`)} ${value}`).join(' * ')}
          </p>
        </div>
        <div class="w-10 h-8 p-2 flex flex-col justify-between cursor-pointer" onClick={() => openModalMode('switchTab')}>
          <p class="w-full border border-black" />
          <p class="w-full border border-black" />
          <p class="w-full border border-black" />
        </div>
      </div>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'abilities'}>
            <For each={Object.entries(dict().abilities)}>
              {([slug, ability]) =>
                <div class="flex items-start mb-2">
                  <div
                    class="white-box flex flex-col items-center w-2/5 p-2 cursor-pointer"
                    onClick={() => openModalMode('changeAbilities')}
                  >
                    <p class="text-sm mb-1">{ability} {decoratedData().abilities[slug]}</p>
                    <p class="text-2xl mb-1">{modifier(decoratedData().modifiers[slug])}</p>
                  </div>
                  <div class="w-3/5 pl-4">
                    <div
                      class="white-box p-2 cursor-pointer"
                      onClick={() => openModalMode('changeSkills')}
                    >
                      <div class="flex justify-between">
                        <p>{t('terms.saveDC')}</p>
                        <p>{modifier(decoratedData().save_dc[slug])}</p>
                      </div>
                      <div class="mt-2">
                        <For each={decoratedData().skills.filter((item) => item.ability === slug)}>
                          {(skill) =>
                            <div class="flex justify-between">
                              <p class={`${skill.selected ? 'font-medium' : 'opacity-50'}`}>
                                {t(`skills.${skill.name}`)}
                              </p>
                              <p class={`${skill.selected ? 'font-medium' : 'opacity-50'}`}>
                                {modifier(skill.modifier)}
                              </p>
                            </div>
                          }
                        </For>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </For>
          </Match>
          <Match when={activeTab() === 'combat'}>
            <StatsBlock
              items={[
                { title: t('terms.armorClass'), value: decoratedData().combat.armor_class },
                { title: t('terms.initiative'), value: modifier(decoratedData().combat.initiative) },
                { title: t('terms.speed'), value: decoratedData().combat.speed }
              ]}
            />
            <StatsBlock
              items={[
                { title: t('terms.health.current'), value: decoratedData().combat.health.current },
                { title: t('terms.health.max'), value: decoratedData().combat.health.max },
                { title: t('terms.health.temp'), value: decoratedData().combat.health.temp }
              ]}
              onClick={() => openModalMode('changeHealth')}
            />
            {renderAttacksBox(`${t('terms.attackAction')} - ${decoratedData().combat.attacks_per_action}`, decoratedData().attacks.filter((item) => item.action_type === 'action'))}
            {renderAttacksBox(`${t('terms.attackBonusAction')} - 1`, decoratedData().attacks.filter((item) => item.action_type === 'bonus action'))}
            <For each={decoratedData().class_features}>
              {(class_feature) =>
                <Toggle title={renderClassFeatureTitle(class_feature)}>
                  <p class="text-sm">{class_feature.description}</p>
                </Toggle>
              }
            </For>
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <StatsBlock
              items={[
                { title: t('equipment.gold'), value: changingCoins().gold },
                { title: t('equipment.silver'), value: changingCoins().silver },
                { title: t('equipment.copper'), value: changingCoins().copper }
              ]}
              onClick={() => openModalMode('changeCoins')}
            />
            <Show when={characterItems() !== undefined}>
              <button class="mb-2 py-2 px-4 bg-gray-200 rounded" onClick={() => changeTab('items')}>{t('character.items')}</button>
              {renderItemsBox(t('character.equipment'), characterItems().filter((item) => item.ready_to_use))}
              {renderItemsBox(t('character.backpack'), characterItems().filter((item) => !item.ready_to_use))}
              <div class="flex justify-end">
                <div class="p-4 flex white-box">
                  <p>{calculateCurrentLoad()} / {decoratedData().load}</p>
                </div>
              </div>
            </Show>
          </Match>
          <Match when={activeTab() === 'spells'}>
            <Switch>
              <Match when={spellClasses().length === 0}>
                <div class="p-4 flex white-box">
                  <p>{t('character.no_magic')}</p>
                </div>
              </Match>
              <Match when={characterSpells() !== undefined}>
                <div class="flex justify-between items-center mb-2">
                  <Checkbox
                    left
                    disabled={false}
                    labelText={t('character.onlyPreparedSpells')}
                    value={preparedSpellFilter()}
                    onToggle={() => setPreparedSpellFilter(!preparedSpellFilter())}
                  />
                  <Show when={spellClasses().length > 1}>
                    <Select
                      classList="w-40"
                      items={spellClasses().reduce((acc, item) => { acc[item] = t(`classes.${item}`); return acc; }, { 'all': t('character.allSpells') })}
                      selectedValue={activeSpellClass()}
                      onSelect={(value) => setActiveSpellClass(value)}
                    />
                  </Show>
                </div>
                <Show when={activeSpellClass() !== 'all'}>
                  <StatsBlock
                    items={[
                      { title: t('terms.spellAttack'), value: modifier(decoratedData().spell_classes[activeSpellClass()].attack_bonus) },
                      { title: t('terms.saveDC'), value: decoratedData().spell_classes[activeSpellClass()].save_dc }
                    ]}
                  />
                  <div class="mb-2 p-4 flex white-box">
                    <div class="flex-1 flex flex-col items-center">
                      <p class="uppercase text-xs mb-1">{t('terms.cantrips')}</p>
                      <p class="text-2xl mb-1">
                        {decoratedData().spell_classes[activeSpellClass()].cantrips_amount}
                      </p>
                    </div>
                    <div class="flex-1 flex flex-col items-center">
                      <p class="uppercase text-xs mb-1">{t('terms.known')}</p>
                      <p class="text-2xl mb-1 flex gap-2 items-start">
                        <Show
                          when={decoratedData().spell_classes[activeSpellClass()].spells_amount}
                          fallback={<span>-</span>}
                        >
                          <span>{decoratedData().spell_classes[activeSpellClass()].spells_amount}</span>
                        </Show>
                        <span class="text-sm">{decoratedData().spell_classes[activeSpellClass()].max_spell_level} level</span>
                      </p>
                    </div>
                    <div class="flex-1 flex flex-col items-center">
                      <p class="uppercase text-xs mb-1">{t('terms.prepared')}</p>
                      <p class="text-2xl mb-1">
                        {decoratedData().spell_classes[activeSpellClass()].prepared_spells_amount}
                      </p>
                    </div>
                  </div>
                </Show>
                <Show when={CLASSES_LEARN_SPELLS.includes(activeSpellClass())}>
                  <button class="mb-2 py-2 px-4 bg-gray-200 rounded" onClick={() => changeTab('knownSpells')}>{t('character.knownSpells')}</button>
                </Show>
                <div class="white-box mb-2 p-4">
                  <div class="flex justify-between items-center">
                    <h2 class="text-lg">{t('terms.cantrips')}</h2>
                  </div>
                  <table class="w-full table first-column-full-width">
                    <thead>
                      <tr>
                        <td />
                        <td />
                      </tr>
                    </thead>
                    <tbody>
                      <For each={staticSpells()['0']}>
                        {(spell) =>
                          <tr>
                            <td class="py-1">
                              <p>
                                {spell}
                              </p>
                              <p class="text-xs">{t('character.staticSpell')}</p>
                            </td>
                            <td />
                          </tr>
                        }
                      </For>
                      <For each={filteredSpells()[0]}>
                        {(spell) =>
                          <tr>
                            <td class="py-1">
                              <p class={`${spell.ready_to_use ? '' : 'opacity-50'}`}>
                                {spell.name}
                              </p>
                              <Show when={spellClasses().length > 1 && activeSpellClass() === 'all'}>
                                <p class="text-xs">{t(`classes.${spell.prepared_by}`)}</p>
                              </Show>
                            </td>
                            <td>
                              <Show when={CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
                                <Show
                                  when={spell.ready_to_use}
                                  fallback={<span class="cursor-pointer" onClick={() => prepareSpell(spell.id)}>Prepare</span>}
                                >
                                  <span class="cursor-pointer" onClick={() => disableSpell(spell.id)}>Disable</span>
                                </Show>
                              </Show>
                            </td>
                          </tr>
                        }
                      </For>
                    </tbody>
                  </table>
                </div>
                <For each={Object.entries(decoratedData().spells_slots)}>
                  {([level, slotsAmount]) =>
                    <div class="white-box mb-2 p-4">
                      <div class="flex justify-between items-center">
                        <h2 class="text-lg">{level} level</h2>
                        <div class="flex">
                          <For each={[...Array((spentSpellSlots()[level] || 0)).keys()]}>
                            {() =>
                              <p
                                class="w-6 h-6 rounded bg-black mr-1 cursor-pointer"
                                onClick={() => freeSpellSlot(level)}
                              />
                            }
                          </For>
                          <For each={[...Array(slotsAmount - (spentSpellSlots()[level] || 0)).keys()]}>
                            {() =>
                              <p
                                class="w-6 h-6 rounded border-2 border-black mr-1 cursor-pointer"
                                onClick={() => spendSpellSlot(level)}
                              />
                            }
                          </For>
                        </div>
                      </div>
                      <table class="w-full table first-column-full-width">
                        <thead>
                          <tr>
                            <td />
                            <td />
                          </tr>
                        </thead>
                        <tbody>
                          <For each={staticSpells()[level]}>
                            {(spell) =>
                              <tr>
                                <td class="py-1">
                                  <p>
                                    {spell.name}
                                  </p>
                                  <p class="text-xs">{t('character.staticSpell')}</p>
                                </td>
                                <td />
                              </tr>
                            }
                          </For>
                          <For each={filteredSpells()[level]}>
                            {(spell) =>
                              <tr>
                                <td class="py-1">
                                  <p class={`${spell.ready_to_use ? '' : 'opacity-50'}`}>
                                    {spell.name}
                                  </p>
                                  <Show when={spellClasses().length > 1 && activeSpellClass() === 'all'}>
                                    <p class="text-xs">{t(`classes.${spell.prepared_by}`)}</p>
                                  </Show>
                                </td>
                                <td>
                                  <Show when={CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
                                    <Show
                                      when={spell.ready_to_use}
                                      fallback={<span class="cursor-pointer" onClick={() => prepareSpell(spell.id)}>Prepare</span>}
                                    >
                                      <span class="cursor-pointer" onClick={() => disableSpell(spell.id)}>Disable</span>
                                    </Show>
                                  </Show>
                                </td>
                              </tr>
                            }
                          </For>
                        </tbody>
                      </table>
                    </div>
                  }
                </For>
              </Match>
            </Switch>
          </Match>
          <Match when={activeTab() === 'conditions'} />
          <Match when={activeTab() === 'knownSpells'}>
            <Show when={spells() !== undefined}>
              <div class="flex justify-between items-center mb-2">
                <Checkbox
                  left
                  disabled={false}
                  labelText={t('character.onlyAvailableSpells')}
                  value={availableSpellFilter()}
                  onToggle={() => setAvailableSpellFilter(!availableSpellFilter())}
                />
                <Show when={spellClasses().length > 1}>
                  <Select
                    classList="w-40"
                    items={spellClasses().reduce((acc, item) => { acc[item] = t(`classes.${item}`); return acc; }, {})}
                    selectedValue={activeSpellClass()}
                    onSelect={(value) => setActiveSpellClass(value)}
                  />
                </Show>
              </div>
              <For each={filteredSpellsList()}>
                {([level, spells]) =>
                  <Toggle title={level === '0' ? 'Cantrips' : `${level} level`}>
                    <table class="w-full table first-column-full-width">
                      <thead>
                        <tr>
                          <td />
                          <td />
                        </tr>
                      </thead>
                      <tbody>
                        <For each={spells}>
                          {(spell) =>
                            <tr>
                              <td class="py-1">
                                <p class={`${knownSpellIds().includes(spell.id) ? '' : 'opacity-50'}`}>{spell.name}</p>
                                <Show
                                  when={!availableSpellFilter()}
                                  fallback={
                                    <Show when={knownSpellIds().includes(spell.id)}>
                                      <p class="text-xs mt-1">
                                        {t(`classes.${characterSpells().find((item) => item.spell_id === spell.id).prepared_by}`)}
                                      </p>
                                    </Show>
                                  }
                                >
                                  <p class="text-xs text-wrap">
                                    {spell.available_for.map((item) => dict().classes[item]).join(' * ')}
                                  </p>
                                </Show>
                              </td>
                              <td>
                                <Show
                                  when={knownSpellIds().includes(spell.id)}
                                  fallback={<p class="cursor-pointer" onClick={() => learnSpell(spell.id)}>Learn</p>}
                                >
                                  <p
                                    class="cursor-pointer"
                                    onClick={() => forgetSpell(spell.id)}
                                  >Forget</p>
                                </Show>
                              </td>
                            </tr>
                          }
                        </For>
                      </tbody>
                    </table>
                  </Toggle>
                }
              </For>
            </Show>
          </Match>
          <Match when={activeTab() === 'items'}>
            <Show when={items() !== undefined}>
              {renderItems(t('character.itemsList'), items().filter((item) => item.kind === 'item'))}
              {renderItems(t('character.weaponsList'), items().filter((item) => item.kind.includes('weapon')))}
              {renderItems(t('character.armorList'), items().filter((item) => item.kind.includes('armor') || item.kind.includes('shield')))}
            </Show>
          </Match>
          <Match when={activeTab() === 'features'}>
            <div class="flex flex-col">
              <Show
                when={features() !== undefined && features().length > 0}
                fallback={<p>{t('character.no_features')}</p>}
              >
                {console.log(features())}
                <For each={features()}>
                  {(feature) =>
                    <Toggle title={feature.name[locale()]}>
                      <p class="text-sm mb-2">{feature.description[locale()]}</p>
                      <Switch>
                        <Match when={feature.options_type === 'static' && feature.limit === undefined}>
                          {console.log(feature)}
                          {console.log(feature.options)}
                          <For each={feature.options}>
                            {(option) =>
                              <div class="mb-2">
                                <Checkbox
                                  right
                                  disabled={false}
                                  labelText={t(`selectedFeatures.${feature.slug}.${option}`)}
                                  value={featuresFormData()[feature.slug]?.includes(option)}
                                  onToggle={() => toggleFeatureOption(feature, option)}
                                />
                              </div>
                            }
                          </For>
                        </Match>
                        <Match when={feature.options_type === 'static' && feature.limit === 1}>
                          <Select
                            classList="w-full mb-2"
                            items={feature.options.reduce((acc, option) => { acc[option] = t(`selectedFeatures.${feature.slug}.${option}`); return acc; }, {})}
                            selectedValue={featuresFormData()[feature.slug]}
                            onSelect={(option) => setFeaturesFormData({ ...featuresFormData(), [feature.slug]: [option] })}
                          />
                        </Match>
                      </Switch>
                    </Toggle>
                  }
                </For>
                <button
                  class="py-2 px-4 bg-gray-200 rounded"
                  onClick={updateCharacterFeatures}
                >{t('buttons.save')}</button>
              </Show>
            </div>
          </Match>
        </Switch>
      </div>
      <Modal>
        <Switch>
          <Match when={modalOpenMode() === 'switchTab'}>
            <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
            <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
            <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
            <p class="character-tab-select" onClick={() => changeTab('spells')}>{t('character.spells')}</p>
            <p class="character-tab-select" onClick={() => changeTab('features')}>{t('character.features')}</p>
            <p class="character-tab-select" onClick={() => changeTab('conditions')}>{t('character.conditions')}</p>
            <p class="character-tab-select" onClick={() => openModalMode('changeLevels')}>{t('character.changeLevels')}</p>
            <p class="character-tab-select" onClick={() => openModalMode('changeClasses')}>{t('character.changeClasses')}</p>
          </Match>
          <Match when={modalOpenMode() === 'changeAbilities'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(dict().abilities)}>
                {([slug, ability]) =>
                  <div class="mb-4 flex items-center">
                    <p class="flex-1 text-sm text-left">{ability}</p>
                    <div class="flex justify-between items-center ml-4 w-32">
                      <button
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => changeAbility(slug, 'down')}
                      >-</button>
                      <p>{abilitiesFormData()[slug]}</p>
                      <button
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => changeAbility(slug, 'up')}
                      >+</button>
                    </div>
                  </div>
                }
              </For>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterAbilities}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeHealth'}>
            <div class="white-box p-4 flex flex-col">
              <For each={['current', 'max', 'temp']}>
                {(health) =>
                  <div class="mb-4 flex items-center">
                    <p class="flex-1 text-sm text-left">{t(`terms.health.${health}`)}</p>
                    <div class="flex justify-between items-center ml-4 w-32">
                      <button
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => changeHealth(health, 'down')}
                      >-</button>
                      <p>{healthFormData()[health]}</p>
                      <button
                        class="white-box flex py-2 px-4 justify-center items-center"
                        onClick={() => changeHealth(health, 'up')}
                      >+</button>
                    </div>
                  </div>
                }
              </For>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterHealth}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeSkills'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(dict().skills).sort((a, b) => a[1] > b[1])}>
                {([slug, skill]) =>
                  <div
                    class="flex flex-row justify-between items-center cursor-pointer"
                    onClick={() => changeSkill(slug)}
                  >
                    <p
                      class={`${skillsFormData().includes(slug) ? '' : 'opacity-50'}`}
                    >{skill}</p>
                    <div class="w-16 flex justify-end">
                      <p class={`checkbox-dummy ${skillsFormData().includes(slug) ? 'selected' : ''}`} />
                    </div>
                  </div>
                }
              </For>
              <button
                class="mt-2 py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterSkills}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeLevels'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(classesFormData())}>
                {([class_name, class_level]) =>
                  <div>
                    <div class="mb-2 flex items-center">
                      <p class="flex-1 text-sm text-left">{t(`classes.${class_name}`)}</p>
                      <div class="flex justify-between items-center ml-4 w-32">
                        <button
                          class="white-box flex py-2 px-4 justify-center items-center"
                          onClick={() => changeClass(class_name, 'down')}
                        >-</button>
                        <p>{class_level}</p>
                        <button
                          class="white-box flex py-2 px-4 justify-center items-center"
                          onClick={() => changeClass(class_name, 'up')}
                        >+</button>
                      </div>
                    </div>
                    <Show
                      when={!decoratedData().subclasses[class_name]}
                      fallback={<p class="mb-2">{dict().subclasses[class_name][decoratedData().subclasses[class_name]]}</p>}
                    >
                      <Select
                        classList="w-full mb-2"
                        items={dict().subclasses[class_name]}
                        selectedValue={subclasses()[class_name]}
                        onSelect={(value) => setSubclasses({ ...subclasses, [class_name]: value })}
                      />
                    </Show>
                  </div>
                }
              </For>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterClasses}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeClasses'}>
            <div class="white-box p-4 flex flex-col">
              <For each={Object.entries(dict().classes).filter(([a,]) => a !== decoratedData().main_class).sort((a, b) => a[1] > b[1])}>
                {([slug, class_name]) =>
                  <div
                    class="flex flex-row justify-between items-center cursor-pointer"
                    onClick={() => addOrRemoveClass(slug)}
                  >
                    <p
                      class={`${classesFormData()[slug] ? '' : 'opacity-50'}`}
                    >{class_name}</p>
                    <div class="w-16 flex justify-end">
                      <p class={`checkbox-dummy ${classesFormData()[slug] ? 'selected' : ''}`} />
                    </div>
                  </div>
                }
              </For>
              <button
                class="mt-2 py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterClasses}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeQuantity'}>
            <div class="white-box p-4 flex flex-col">
              <div class="mb-4 flex items-center">
                <p class="flex-1 text-sm text-left">{changingItem().name}</p>
                <div class="flex justify-between items-center ml-4 w-32">
                  <button
                    class="white-box flex py-2 px-4 justify-center items-center"
                    onClick={() => setChangingItem({ ...changingItem(), quantity: changingItem().quantity - 1 })}
                  >-</button>
                  <p>{changingItem().quantity}</p>
                  <button
                    class="white-box flex py-2 px-4 justify-center items-center"
                    onClick={() => setChangingItem({ ...changingItem(), quantity: changingItem().quantity + 1 })}
                  >+</button>
                </div>
              </div>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateCharacterItemQuantity}
              >{t('buttons.save')}</button>
            </div>
          </Match>
          <Match when={modalOpenMode() === 'changeCoins'}>
            <div class="white-box p-4 flex flex-col">
              <For each={['gold', 'silver', 'copper']}>
                {(coin) =>
                  <div class="mb-4 flex justify-between items-center">
                    <p class="flex-1 text-sm mr-4">{t(`equipment.${coin}`)}</p>
                    <input
                      class="border border-gray-200 rounded text-right py-1 px-2 w-16"
                      onInput={(e) => setChangingCoins({ ...changingCoins(), [coin]: Number(e.target.value) })}
                      value={changingCoins()[coin]}
                    />
                  </div>
                }
              </For>
              <button
                class="py-2 px-4 bg-gray-200 rounded"
                onClick={updateCoins}
              >{t('buttons.save')}</button>
            </div>
          </Match>
        </Switch>
      </Modal>
    </div>
  );
}
