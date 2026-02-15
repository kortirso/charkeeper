import { createSignal, createEffect, For, Show, createMemo, batch, Switch, Match } from 'solid-js';

import { SpellsToggleList } from './SpellsToggleList';
import { SpellCastTime, SpellRange, SpellAttack, SpellComponents, SpellDuration, SpellEffects } from '../../../../pages';
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
import { fetchSpellRequest } from '../../../../requests/fetchSpellRequest';
import { modifier, localize } from '../../../../helpers';

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
    filterByClass: 'Filter by class',
    damageUp: '<p>The damage increases by 1 dice when you reach levels 5, 11 and 17.</p>',
    check: 'Spell attack'
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
    filterByClass: 'Фильтр по классам',
    damageUp: '<p>Урон увеличивается на 1 кость, когда вы достигаете 5, 11 и 17 уровня.</p>',
    check: 'Атака заклинанием'
  }
}

export const Dnd2024Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [activeSpellClass, setActiveSpellClass] = createSignal(undefined);
  const [descriptions, setDescriptions] = createSignal({});
  const [openDescriptions, setOpenDescriptions] = createSignal({});

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

  const cantripsDamageDice = createMemo(() => {
    const level = character().level;
    const modifier = level >= 17 ? 4 : (level >= 11 ? 3 : (level >= 5 ? 2 : 1));
    return `${modifier}d`;
  });

  // все заклинания доступные для изучения
  const filteredSpellsList = createMemo(() => {
    if (spells() === undefined) return [];
    if (lastActiveCharacterId() !== character().id) return [];

    return spells().filter((item) => {
      if (item.level > character().available_spell_level) return false;
      if (!availableSpellFilter()) return true;

      return item.origin_values.includes(activeSpellClass());
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
  const staticSpellIds = createMemo(() => character().formatted_static_spells.map(({ feat_id }) => feat_id));

  // id всех известных заклинаний
  const knownSpellIds = createMemo(() => {
    if (lastActiveCharacterId() !== character().id) return [];
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ feat_id }) => feat_id).concat(staticSpellIds());
  });

  const canPrepareSpells = createMemo(() => {
    return DND2024_CLASSES_PREPARE_SPELLS.includes(activeSpellClass());
  });

  const learnSpell = async (event, spellId) => {
    event.stopPropagation();

    const result = await createCharacterSpellRequest(
      appState.accessToken,
      props.character.provider,
      props.character.id,
      { spell_id: spellId, target_spell_class: activeSpellClass(), spell_ability: spellAbility() }
    );
    if (result.errors_list === undefined) setCharacterSpells(characterSpells().concat(result.spell));
  }

  const forgetSpell = async (event, spellId) => {
    event.stopPropagation();

    const result = await removeCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId);
    if (result.errors_list === undefined) setCharacterSpells(characterSpells().filter((item) => item.feat_id !== spellId));
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

  const showInfo = async (spell) => {
    if (descriptions()[spell.id]) {
      setOpenDescriptions({ ...openDescriptions(), [spell.id]: !openDescriptions()[spell.id] })
    } else {
      const result = await fetchSpellRequest(appState.accessToken, props.character.provider, spell.id);

      if (result.errors_list === undefined) {
        let value = result.description;
        if (spell.damage_up) {
          value = value.replace('1d', cantripsDamageDice());
          value += localize(TRANSLATION, locale()).damageUp;
        }
        batch(() => {
          setDescriptions({ ...descriptions(), [spell.id]: value });
          setOpenDescriptions({ ...openDescriptions(), [spell.id]: true })
        });
      }
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd2024Spells' }}>
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
                  <>
                    <div class="mb-2 px-4 py-2">
                      <h2 class="text-lg dark:text-snow">
                        <Show when={level !== 0} fallback={localize(TRANSLATION, locale())['cantrips']}>
                          {level} {localize(TRANSLATION, locale())['level']}
                        </Show>
                      </h2>
                    </div>
                    <For each={filteredSpellsList().filter((item) => item.level === level)}>
                      {(spell) =>
                        <Toggle
                          disabled
                          onParentClick={() => showInfo(spell)}
                          isOpenByParent={openDescriptions()[spell.id]}
                          containerClassList="mb-1!"
                          title={
                            <div class="dnd2024-spell">
                              <div class="dnd2024-spell-header">
                                <div>
                                  <div class="dnd2024-spell-titlebox">
                                    <p class="dnd2024-spell-title">
                                      {spell.title}
                                    </p>
                                    <Show when={spell.ritual}><span>{localize(TRANSLATION, locale()).ritual}</span></Show>
                                    <Show when={spell.concentration}><span class="ml-1">{localize(TRANSLATION, locale()).concentration}</span></Show>
                                  </div>
                                  <Show
                                    when={!availableSpellFilter()}
                                    fallback={
                                      <Show when={knownSpellIds().includes(spell.id) && !staticSpellIds().includes(spell.id)}>
                                        <p class="text-xs mt-1">
                                          {config.classes[characterSpells().find((item) => item.feat_id === spell.id).prepared_by]['name'][locale()]}
                                        </p>
                                      </Show>
                                    }
                                  >
                                    <p class="text-xs text-wrap">
                                      {spell.origin_values.map((item) => config.classes[item]['name'][locale()]).join(' * ')}
                                    </p>
                                  </Show>
                                </div>
                                <div>
                                  <Switch fallback={<></>}>
                                    <Match when={!knownSpellIds().includes(spell.id)}>
                                      <Button default size="small" onClick={(event) => learnSpell(event, spell.id)}>
                                        <Plus width={20} height={20} />
                                      </Button>
                                    </Match>
                                    <Match when={!staticSpellIds().includes(spell.id)}>
                                      <Button default size="small" onClick={(event) => forgetSpell(event, spell.id)}>
                                        <Minus width={20} height={20} />
                                      </Button>
                                    </Match>
                                  </Switch>
                                </div>
                              </div>
                              <div class="dnd2024-spell-tooltips">
                                <SpellCastTime value={spell.time} />
                                <SpellRange value={spell.range} />
                                <SpellAttack hit={spell.hit} dc={spell.dc} character={character()} activeSpellClass={activeSpellClass()} />
                                <SpellEffects
                                  value={spell.effects}
                                  cantripsDamageDice={spell.damage_up ? cantripsDamageDice() : null}
                                />
                                <SpellComponents value={spell.components} />
                                <SpellDuration value={spell.duration} />
                              </div>
                            </div>
                          }
                        >
                          <p
                            class="feat-markdown"
                            innerHTML={descriptions()[spell.id]} // eslint-disable-line solid/no-innerhtml
                          />
                        </Toggle>
                      }
                    </For>
                  </>
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
                        onClick={() => props.openDiceRoll('/check attack spell', character().spell_classes[activeSpellClass()].attack_bonus, localize(TRANSLATION, locale())['check'])}
                      />
                  },
                  { title: localize(TRANSLATION, locale())['saveDC'], value: character().spell_classes[activeSpellClass()].save_dc }
                ]}
              />
              <div class="mb-2 p-4 flex blockable">
                <div class="flex-1 flex flex-col items-center dark:text-snow">
                  <p class="uppercase text-xs mb-1">{localize(TRANSLATION, locale())['cantrips']}</p>
                  <p class="text-2xl mb-1">
                    {character().spell_classes[activeSpellClass()].cantrips_amount}
                  </p>
                </div>
                <div class="flex-1 flex flex-col items-center dark:text-snow">
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
            <SpellsToggleList
              level={0}
              character={character()}
              activeSpellClass={activeSpellClass()}
              spells={filteredCharacterSpells().filter((item) => item.spell.level === 0)}
              canPrepareSpells={canPrepareSpells()}
              onEnableSpell={enableSpell}
              onDisableSpell={disableSpell}
              onUpdateCharacterSpell={updateCharacterSpell}
              openDiceRoll={props.openDiceRoll}
              openAttackRoll={props.openAttackRoll}
            />
            <For each={Array.from([...Array(character().available_spell_level).keys()], (x) => x + 1)}>
              {(level) =>
                <SpellsToggleList
                  level={level}
                  character={character()}
                  activeSpellClass={activeSpellClass()}
                  spells={filteredCharacterSpells().filter((item) => item.spell.level === level)}
                  spentSpellSlots={character().spent_spell_slots}
                  canPrepareSpells={canPrepareSpells()}
                  slotsAmount={character().spells_slots[level]}
                  onEnableSpell={enableSpell}
                  onDisableSpell={disableSpell}
                  onSpendSpellSlot={spendSpellSlot}
                  onFreeSpellSlot={freeSpellSlot}
                  onUpdateCharacterSpell={updateCharacterSpell}
                  openDiceRoll={props.openDiceRoll}
                  openAttackRoll={props.openAttackRoll}
                />
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
