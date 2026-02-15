import { createSignal, createEffect, For, Show, createMemo, batch, Switch, Match } from 'solid-js';

import { SpellsTable } from './SpellsTable';
import { StatsBlock, ErrorWrapper, Button, Toggle, Checkbox, Select, GuideWrapper, Dice } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale } from '../../../../context';
import {
  Plus, Minus, Avatar, Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock,
  Wizard
} from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const DND5_CLASSES_PREPARE_SPELLS = ['cleric', 'druid', 'paladin', 'artificer', 'wizard'];
const DND2024_CLASSES_PREPARE_SPELLS = [
  'bard', 'ranger', 'sorcerer', 'warlock', 'cleric', 'druid', 'paladin', 'artificer', 'wizard'
];
const CLASS_ICONS = {
  'static': Avatar, 'artificer': Artificer, 'barbarian': Barbarian, 'bard': Bard, 'cleric': Cleric, 'druid': Druid,
  'fighter': Fighter, 'monk': Monk, 'paladin': Paladin, 'ranger': Ranger, 'rogue': Rogue, 'sorcerer': Sorcerer,
  'warlock': Warlock, 'wizard': Wizard
}
const TRANSLATION = {
  en: {
    cantrips: 'Cantrips',
    level: 'level',
    knownSpells: 'Learning spells',
    prepared: 'Prepared',
    known: 'Known',
    spellAttack: 'Spell attack',
    saveDC: 'Save DC',
    onlyAvailableSpells: 'Only available',
    onlyPreparedSpells: 'Only prepared',
    customSpellAbility: 'Learn with custom spell ability',
    back: 'Back',
    noValue: 'Default',
    filterByClass: 'Filter by class'
  },
  ru: {
    cantrips: 'Заговоры',
    level: 'уровень',
    knownSpells: 'Изучение заклинаний',
    prepared: 'Подготовленные',
    known: 'Известные',
    spellAttack: 'Бонус атаки',
    saveDC: 'Спасброски',
    onlyAvailableSpells: 'Только доступные',
    onlyPreparedSpells: 'Только подготовленные',
    customSpellAbility: 'Изучить с магической характеристикой',
    back: 'Назад',
    noValue: 'Стандартная',
    filterByClass: 'Фильтр по классам'
  }
}

export const Dnd5Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [activeSpellClass, setActiveSpellClass] = createSignal(undefined);

  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [availableSpellFilter, setAvailableSpellFilter] = createSignal(true);
  const [preparedSpellFilter, setPreparedSpellFilter] = createSignal(true);
  const [spellAbility, setSpellAbility] = createSignal(null);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const spellLevels = Object.keys(character().spells_slots || {});

    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      props.character.provider,
      { max_level: spellLevels.length === 0 ? 3 : Math.max(...spellLevels) }
    );
    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(
      appState.accessToken, character().provider, character().id
    );

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells);
        });
      }
    );

    batch(() => {
      setActiveSpellClass(Object.keys(character().spell_classes)[0] || 'static');
      setLastActiveCharacterId(character().id);
      setSpellsSelectingMode(false);
    })
  });

  // все заклинания доступные для изучения
  const filteredSpellsList = createMemo(() => {
    if (spells() === undefined) return [];
    if (lastActiveCharacterId() !== character().id) return [];

    return spells().filter((item) => {
      if (item.level > character().available_spell_level) return false;
      if (!availableSpellFilter()) return true;

      return item.available_for.includes(activeSpellClass());
    });
  });

  // заклинания выбранного персонажа
  const filteredCharacterSpells = createMemo(() => {
    if (characterSpells() === undefined) return [];
    if (lastActiveCharacterId() !== character().id) return [];
    if (activeSpellClass() === 'static') return character().formatted_static_spells;

    const result = characterSpells().filter((item) => {
      if (activeSpellClass() && item.prepared_by !== activeSpellClass()) return false;
      if (preparedSpellFilter()) return item.ready_to_use;
      if (Object.keys(character().static_spells).includes(item.slug)) return false;
      return true;
    });

    if (activeSpellClass() === undefined) return result.concat(character().formatted_static_spells);
    return result;
  });

  const spellClassesList = createMemo(() => {
    const result = Object.keys(character().spell_classes);
    if (Object.keys(character().static_spells).length > 0 && !spellsSelectingMode()) result.push('static');

    return result;
  });

  // id врождённых заклинаний
  const staticSpellIds = createMemo(() => character().formatted_static_spells.map(({ id }) => id));

  // id всех известных заклинаний
  const knownSpellIds = createMemo(() => {
    if (lastActiveCharacterId() !== character().id) return [];
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ spell_id }) => spell_id).concat(staticSpellIds());
  });

  const canPrepareSpells = createMemo(() => {
    return character().provider === 'dnd5' ? DND5_CLASSES_PREPARE_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_PREPARE_SPELLS.includes(activeSpellClass());
  });

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(
      appState.accessToken,
      props.character.provider,
      props.character.id,
      { spell_id: spellId, target_spell_class: targetSpellClass, spell_ability: spellAbility() }
    );
    if (result.errors_list === undefined) setCharacterSpells(characterSpells().concat(result.spell));
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId);
    if (result.errors_list === undefined) setCharacterSpells(characterSpells().filter((item) => item.spell_id !== spellId));
  }

  const enableSpell = (spellId) => updateCharacterSpell(spellId, { 'ready_to_use': true });
  const disableSpell = (spellId) => updateCharacterSpell(spellId, { 'ready_to_use': false });

  const spendSpellSlot = async (level) => {
    let newValue;
    if (character().spent_spell_slots[level]) {
      newValue = { ...character().spent_spell_slots, [level]: character().spent_spell_slots[level] + 1 };
    } else {
      newValue = { ...character().spent_spell_slots, [level]: 1 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { spent_spell_slots: newValue }, only_head: true }
    );
    if (result.errors_list === undefined) props.onReplaceCharacter({ spent_spell_slots: newValue });
  }

  const freeSpellSlot = async (level) => {
    const newValue = { ...character().spent_spell_slots, [level]: character().spent_spell_slots[level] - 1 };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { spent_spell_slots: newValue }, only_head: true }
    );
    if (result.errors_list === undefined) props.onReplaceCharacter({ spent_spell_slots: newValue });
  }

  const updateCharacterSpell = async (spellId, payload) => {
    const result = await updateCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spellId, payload
    );

    if (result.errors_list === undefined) {
      batch(() => {
        const newValue = characterSpells().slice().map((element) => {
          if (element.id !== spellId) return element;
          return { ...element, ...payload }
        });
        setCharacterSpells(newValue);
      });
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Spells' }}>
      <GuideWrapper character={character()}>
        <Show
          when={!spellsSelectingMode()}
          fallback={
            <>
              <div class="flex justify-between items-center mb-2">
                <Checkbox
                  labelText={localize(TRANSLATION, locale())['onlyAvailableSpells']}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={availableSpellFilter()}
                  onToggle={() => setAvailableSpellFilter(!availableSpellFilter())}
                />
                <Show when={spellClassesList().length > 1}>
                  <div class="flex gap-x-1">
                    <For each={Object.entries(CLASS_ICONS).filter(([className,]) => spellClassesList().includes(className))}>
                      {([className, Component]) =>
                        <span
                          class="cursor-pointer dark:text-snow w-8 h-8 rounded-full bg-dusty flex justify-center items-center"
                          classList={{ 'opacity-50': className !== activeSpellClass() }}
                          onClick={() => setActiveSpellClass(className)}
                        >
                          <Component width="24" height="24" />
                        </span>
                      }
                    </For>
                  </div>
                </Show>
              </div>
              <div class="mb-4 flex">
                <Select
                  labelText={localize(TRANSLATION, locale())['customSpellAbility']}
                  items={{ 'null': localize(TRANSLATION, locale())['noValue'], 'int': config.abilities.int.name[locale()], 'wis': config.abilities.wis.name[locale()], 'cha': config.abilities.cha.name[locale()] }}
                  selectedValue={spellAbility()}
                  onSelect={(value) => setSpellAbility(value === 'null' ? null : value)}
                />
              </div>
              <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(false)}>{localize(TRANSLATION, locale())['back']}</Button>
              <For each={[...Array(character().available_spell_level + 1).keys()]}>
                {(level) =>
                  <Toggle title={level === 0 ? localize(TRANSLATION, locale())['cantrips'] : `${level} ${localize(TRANSLATION, locale())['level']}`}>
                    <table class="w-full table first-column-full-width">
                      <tbody>
                        <For each={filteredSpellsList().filter((item) => item.level === level)}>
                          {(spell) =>
                            <tr>
                              <td class="py-1 pl-1">
                                <p class={`${knownSpellIds().includes(spell.id) ? '' : 'opacity-50'}`}>{spell.name}</p>
                                <Show
                                  when={!availableSpellFilter()}
                                  fallback={
                                    <Show when={knownSpellIds().includes(spell.id) && !staticSpellIds().includes(spell.id)}>
                                      <p class="text-xs mt-1">
                                        {config.classes[characterSpells().find((item) => item.spell_id === spell.id).prepared_by]['name'][locale()]}
                                      </p>
                                    </Show>
                                  }
                                >
                                  <p class="text-xs text-wrap">
                                    {spell.available_for.map((item) => config.classes[item]['name'][locale()]).join(' * ')}
                                  </p>
                                </Show>
                              </td>
                              <td>
                                <Switch fallback={<></>}>
                                  <Match when={!knownSpellIds().includes(spell.id)}>
                                    <Button default size="small" onClick={() => learnSpell(spell.id, activeSpellClass())}>
                                      <Plus width={20} height={20} />
                                    </Button>
                                  </Match>
                                  <Match when={!staticSpellIds().includes(spell.id)}>
                                    <Button default size="small" onClick={() => forgetSpell(spell.id)}>
                                      <Minus width={20} height={20} />
                                    </Button>
                                  </Match>
                                </Switch>
                              </td>
                            </tr>
                          }
                        </For>
                      </tbody>
                    </table>
                  </Toggle>
                }
              </For>
            </>
          }
        >
          <Show when={spells() !== undefined}>
            <Show when={lastActiveCharacterId() === character().id && activeSpellClass() && character().spell_classes[activeSpellClass()]?.save_dc}>
              <StatsBlock
                items={[
                  {
                    title: localize(TRANSLATION, locale())['spellAttack'],
                    value:
                      <Dice
                        width="36"
                        height="36"
                        text={modifier(character().spell_classes[activeSpellClass()].attack_bonus)}
                        onClick={() => props.openDiceRoll('/check attack spell', character().spell_classes[activeSpellClass()].attack_bonus)}
                      />
                  },
                  { title: localize(TRANSLATION, locale())['saveDC'], value: character().spell_classes[activeSpellClass()].save_dc }
                ]}
              />
              <div class="mb-2 p-4 flex blockable">
                <div class="flex-1 flex flex-col items-center">
                  <p class="uppercase text-xs mb-1">{localize(TRANSLATION, locale())['cantrips']}</p>
                  <p class="text-2xl mb-1">
                    {character().spell_classes[activeSpellClass()].cantrips_amount}
                  </p>
                </div>
                <Show when={character().provider === 'dnd5'}>
                  <div class="flex-1 flex flex-col items-center">
                    <p class="uppercase text-xs mb-1">{localize(TRANSLATION, locale())['known']}</p>
                    <p class="text-2xl mb-1 flex gap-2 items-start">
                      <span>{character().spell_classes[activeSpellClass()].spells_amount || '-'}</span>
                      <span class="text-sm">{character().spell_classes[activeSpellClass()].max_spell_level} {localize(TRANSLATION, locale())['level']}</span>
                    </p>
                  </div>
                </Show>
                <div class="flex-1 flex flex-col items-center">
                  <p class="uppercase text-xs mb-1">{localize(TRANSLATION, locale())['prepared']}</p>
                  <p class="text-2xl mb-1">
                    {character().spell_classes[activeSpellClass()].prepared_spells_amount}
                  </p>
                </div>
              </div>
            </Show>
            <div class="flex justify-between items-center mb-2">
              <Show when={activeSpellClass() !== undefined && activeSpellClass() !== 'static'} fallback={<span />}>
                <Checkbox
                  labelText={localize(TRANSLATION, locale())['onlyPreparedSpells']}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={preparedSpellFilter()}
                  onToggle={() => setPreparedSpellFilter(!preparedSpellFilter())}
                />
              </Show>
              <Show when={spellClassesList().length > 1}>
                <div class="flex items-center gap-x-1">
                  <span class="text-xs dark:text-snow">{localize(TRANSLATION, locale()).filterByClass}</span>
                  <For each={Object.entries(CLASS_ICONS).filter(([className,]) => spellClassesList().includes(className))}>
                    {([className, Component]) =>
                      <span
                        class="cursor-pointer dark:text-snow w-8 h-8 rounded-full bg-dusty flex justify-center items-center"
                        classList={{ 'opacity-50': className !== activeSpellClass() }}
                        onClick={() => activeSpellClass() === className ? setActiveSpellClass(undefined) : setActiveSpellClass(className)}
                      >
                        <Component width="24" height="24" />
                      </span>
                    }
                  </For>
                </div>
              </Show>
            </div>
            <Show when={activeSpellClass() !== undefined && activeSpellClass() !== 'static'}>
              <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
                {localize(TRANSLATION, locale()).knownSpells}
              </Button>
            </Show>
            <SpellsTable
              level={0}
              character={character()}
              activeSpellClass={activeSpellClass()}
              spells={filteredCharacterSpells().filter((item) => item.level === 0)}
              canPrepareSpells={canPrepareSpells()}
              onEnableSpell={enableSpell}
              onDisableSpell={disableSpell}
              onUpdateCharacterSpell={updateCharacterSpell}
            />
            <For each={Array.from([...Array(character().available_spell_level).keys()], (x) => x + 1)}>
              {(level) =>
                <SpellsTable
                  level={level}
                  character={character()}
                  activeSpellClass={activeSpellClass()}
                  spells={filteredCharacterSpells().filter((item) => item.level === level)}
                  spentSpellSlots={character().spent_spell_slots}
                  canPrepareSpells={canPrepareSpells()}
                  slotsAmount={character().spells_slots[level]}
                  onEnableSpell={enableSpell}
                  onDisableSpell={disableSpell}
                  onSpendSpellSlot={spendSpellSlot}
                  onFreeSpellSlot={freeSpellSlot}
                  onUpdateCharacterSpell={updateCharacterSpell}
                />
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
