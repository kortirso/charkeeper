import { createSignal, createEffect, createMemo, Show, For, Switch, Match, batch } from 'solid-js';

import { Pathfinder2SpellBook, Pathfinder2Spell } from '../../../../pages';
import { StatsBlock, ErrorWrapper, Button, GuideWrapper, Dice, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { modifier, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    spellAttack: 'Spell attack',
    saveDC: 'Save DC',
    back: 'Back',
    check: 'Spell attack',
    gotoSpellBook: 'Spellbook management',
    cantrips: 'Cantrips',
    level: 'level',
    noSpells: 'There are no learned spells',
    noPreparedSpells: 'There are no prepared spells',
    renderMode: 'Prepare mode',
    prepareSlots: 'Prepare slots',
    noSlots: 'No available spell slots',
    cantripLevel: 'Cantrip level',
    focusSpellBook: 'Focus',
    innateSpellBook: 'Innate',
    focusSpells: 'Focus spells'
  },
  ru: {
    spellAttack: 'Бонус атаки',
    saveDC: 'Спасброски',
    back: 'Назад',
    check: 'Атака заклинанием',
    gotoSpellBook: 'Книга заклинаний',
    cantrips: 'Фокусы',
    level: 'уровень',
    noSpells: 'Нет изученных заклинаний',
    noPreparedSpells: 'Нет подготовленных заклинаний',
    renderMode: 'Режим подготовки',
    prepareSlots: 'Ячейки для подготовки',
    noSlots: 'Нет доступных слотов заклинаний',
    cantripLevel: 'Круг фокусов',
    focusSpellBook: 'Фокальные',
    innateSpellBook: 'Врождённые',
    focusSpells: 'Фокальные заклинания'
  }
}

export const Pathfinder2Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [spells, setSpells] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);

  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(null);
  const [renderMode, setRenderMode] = createSignal(true);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchSpells = async () => await fetchSpellsRequest(
    appState.accessToken,
    character().provider,
    { max_level: character().spells_info?.max_spell_level || 10 }
  );
  const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchSpells(), fetchCharacterSpells()]).then(
      ([spellsData, characterSpellsData]) => {
        batch(() => {
          setSpells(
            spellsData.spells.sort((a, b) => {
              const levelCompare = a.info.level - b.info.level;
              return levelCompare || a.title.localeCompare(b.title);
            })
          );
          setCharacterSpells(
            characterSpellsData.spells.sort((a, b) => {
              const levelCompare = a.spell.info.level - b.spell.info.level;
              return levelCompare || a.spell.title.localeCompare(b.spell.title);
            })
          );
        });
      }
    );

    batch(() => {
      setLastActiveCharacterId(character().id);
      setSpellsSelectingMode(null);
    });
  });

  const groupedCharacterSpells = createMemo(() => {
    if (!characterSpells()) return {};

    return characterSpells().reduce((acc, item) => {
      Object.entries(item.value).forEach(([level, values]) => {
        if (values.selected_count > 0) {
          acc[level] = acc[level] ? acc[level].concat(item) : [item];
        }
      });
      return acc;
    }, {});
  });

  const preparedCharacterSpells = createMemo(() => {
    if (!characterSpells()) return {};

    return characterSpells().reduce((acc, item) => {
      if (item.value.innate || item.value.focus) return acc;

      const level = item.spell.info.level;
      acc[level] = acc[level] ? acc[level].concat(item) : [item];

      return acc;
    }, {});
  });

  const proficiencyBonus = (level) => character().level + (level * 2);

  const groupedStaticSpells = createMemo(() => {
    if (!characterSpells()) return {};

    const profBonus = character().level >= 12 ? proficiencyBonus(2) : proficiencyBonus(1);
    const modifier = character().modified_abilities.cha

    const manualSpells = characterSpells().reduce((acc, item) => {
      if (!item.value.innate) return acc;

      const currentLevel = item.spell.info.level;
      const newItem = { ...item, spell_attack: profBonus + modifier, spell_dc: 10 + profBonus + modifier };
      acc[currentLevel] = acc[currentLevel] ? acc[currentLevel].concat(newItem) : [newItem];

      return acc;
    }, {})

    const autoSpells = character().formatted_static_spells.reduce((acc, item) => {
      const currentLevel = item.spell.info.level
      acc[currentLevel] = acc[currentLevel] ? acc[currentLevel].concat(item) : [item];

      return acc;
    }, {});

    return { ...manualSpells, ...autoSpells };
  });

  const maxSpellLevel = createMemo(() => {
    const spellsMaxLevel = character().spells_info ? character().spells_info.max_spell_level : 0;

    const formattedLevels = character().formatted_static_spells.length > 0 ? character().formatted_static_spells.map((item) => item.spell.info.level) : [0]
    const staticMaxLevel = Math.max(...formattedLevels);

    return Math.max(spellsMaxLevel, staticMaxLevel);
  });

  // использовать слот для сонтанного заклинание
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
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter({ spent_spell_slots: newValue });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // освободить слот для сонтанного заклинание
  const freeSpellSlot = async (level) => {
    const newValue = { ...character().spent_spell_slots, [level]: character().spent_spell_slots[level] - 1 };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { spent_spell_slots: newValue }, only_head: true }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter({ spent_spell_slots: newValue });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  // подготовить заклинание
  const enableSpell = (e, characterSpell, counter, spellLevel) => {
    e.stopPropagation();

    const totalSlots = spellLevel === 0 ? character().spells_info.cantrip_slots : character().spells_info.spells_slots[spellLevel];
    const activeSpellSlots = characterSpells().reduce((acc, item) => {
      if (!item.value[spellLevel]) return acc;

      acc += item.value[spellLevel].selected_count;
      return acc;
    }, 0);
    if (activeSpellSlots >= totalSlots) return renderAlert(localize(TRANSLATION, locale()).noSlots);

    updateCharacterSpell(characterSpell.id, { ready_to_use: true, level: spellLevel, selected_count: counter });
  }

  // отменить подготовку заклинания
  const disableSpell = (e, characterSpell, counter, spellLevel) => {
    e.stopPropagation();

    if (counter === 0) updateCharacterSpell(
      characterSpell.id, { ready_to_use: false, selected_count: 0, used_count: 0, level: spellLevel }
    );
    else updateCharacterSpell(
      characterSpell.id, { ready_to_use: true, selected_count: counter, used_count: characterSpell.value[spellLevel].used_count, level: spellLevel }
    );
  }

  // восстановить слот заклинания
  const unuseSpellSlot = (e, spell, level) => {
    e.stopPropagation();

    if (spell.value[level].used_count === 0) return;

    updateCharacterSpell(spell.id, { used_count: spell.value[level].used_count - 1, level: level });
  }

  // использовать заклинание
  const useSpellSlot = (e, spell, level) => {
    e.stopPropagation();

    if (spell.value[level].used_count >= spell.value[level].selected_count) return;

    updateCharacterSpell(spell.id, { used_count: spell.value[level].used_count + 1, level: level });
  }

  const updateCharacterSpell = async (spellId, payload) => {
    const result = await updateCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spellId, { spell: payload }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          const newValue = characterSpells().slice().map((element) => {
            if (element.id !== spellId) return element;
            return result.spell;
          });
          setCharacterSpells(newValue);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Spells' }}>
      <GuideWrapper character={character()}>
        <Show when={spells()}>
          <Show
            when={spellsSelectingMode() === null}
            fallback={
              <Switch>
                <Match when={spellsSelectingMode() == 'learnFocusSpell'}>
                  <Pathfinder2SpellBook
                    focus
                    character={character()}
                    spells={spells().filter((item) => item.focus_for === character().main_class)}
                    characterSpells={characterSpells().filter((item) => !item.value.innate)}
                    onSetCharacterSpells={setCharacterSpells}
                    onBack={() => setSpellsSelectingMode(null)}
                  />
                </Match>
                <Match when={spellsSelectingMode() == 'learnSpell'}>
                  <Pathfinder2SpellBook
                    character={character()}
                    spells={spells().filter((item) => !item.focus_for)}
                    characterSpells={characterSpells().filter((item) => !item.value.innate)}
                    onSetCharacterSpells={setCharacterSpells}
                    onBack={() => setSpellsSelectingMode(null)}
                  />
                </Match>
                <Match when={spellsSelectingMode() == 'learnInnateSpell'}>
                  <Pathfinder2SpellBook
                    innate
                    character={character()}
                    spells={spells().filter((item) => !item.focus_for)}
                    characterSpells={characterSpells().filter((item) => item.value.innate)}
                    onSetCharacterSpells={setCharacterSpells}
                    onBack={() => setSpellsSelectingMode(null)}
                  />
                </Match>
              </Switch>
            }
          >
            <Show when={character().spells_info}>
              <StatsBlock
                items={[
                  {
                    title: localize(TRANSLATION, locale()).spellAttack,
                    value:
                      <Dice
                        width="36"
                        height="36"
                        text={modifier(character().spell_attack)}
                        onClick={() => props.openDiceRoll('/check attack spell', character().spell_attack, localize(TRANSLATION, locale()).check)}
                      />
                  },
                  { title: localize(TRANSLATION, locale()).saveDC, value: character().spell_dc },
                  { title: localize(TRANSLATION, locale()).cantripLevel, value: Math.round(character().level / 2) }
                ]}
              />
            </Show>
            <Show
              when={character().spells_info}
              fallback={
                <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode('learnInnateSpell')}>
                  {localize(TRANSLATION, locale()).innateSpellBook}
                </Button>
              }
            >
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
                <Button default textable onClick={() => setSpellsSelectingMode('learnFocusSpell')}>
                  {localize(TRANSLATION, locale()).focusSpellBook}
                </Button>
                <Button default textable onClick={() => setSpellsSelectingMode('learnSpell')}>
                  {localize(TRANSLATION, locale()).gotoSpellBook}
                </Button>
                <Button default textable onClick={() => setSpellsSelectingMode('learnInnateSpell')}>
                  {localize(TRANSLATION, locale()).innateSpellBook}
                </Button>
              </div>
            </Show>
            <Show when={character().spells_info?.prepare}>
              <Checkbox
                labelText={localize(TRANSLATION, locale()).renderMode}
                labelPosition="right"
                labelClassList="ml-2"
                classList="mb-2"
                checked={!renderMode()}
                onToggle={() => setRenderMode(!renderMode())}
              />
            </Show>
            <Show when={character().spells_info}>
              <div class="flex justify-between items-center">
                <h2 class="text-lg dark:text-snow mb-2">
                  {localize(TRANSLATION, locale()).focusSpells}
                </h2>
                {/* Фокальные ячейки заклинаний */}
                <div class="flex">
                  <For each={[...Array((character().spent_spell_slots.focus || 0)).keys()]}>
                    {() => <Checkbox filled checked classList="mr-1" onToggle={() => freeSpellSlot('focus')} />}
                  </For>
                  <For each={[...Array((character().spells_info.spells_slots.focus || 3) - (character().spent_spell_slots.focus || 0)).keys()]}>
                    {() => <Checkbox filled classList="mr-1" onToggle={() => spendSpellSlot('focus')} />}
                  </For>
                </div>
              </div>
              <div class="flex flex-col gap-2 mb-4">
                <For each={characterSpells().filter((item) => item.value.focus)}>
                  {(characterSpell) =>
                    <Pathfinder2Spell noLevel spell={characterSpell.spell} cantripLevel={Math.round(character().level / 2)} />
                  }
                </For>
              </div>
            </Show>
            <For each={Array.from([...Array(maxSpellLevel() + 1).keys()])}>
              {(level) =>
                <>
                  <div class="flex justify-between items-center">
                    <h2 class="text-lg dark:text-snow mb-2">
                      <Show when={level !== 0} fallback={localize(TRANSLATION, locale()).cantrips}>
                        {level} {localize(TRANSLATION, locale()).level}
                      </Show>
                    </h2>
                    {/* Ячейки заклинаний спонтанных заклинателей */}
                    <Show when={character().spells_info && level !== 0 && !character().spells_info.prepare}>
                      <div class="flex">
                        <For each={[...Array((character().spent_spell_slots[level] || 0)).keys()]}>
                          {() => <Checkbox filled checked classList="mr-1" onToggle={() => freeSpellSlot(level)} />}
                        </For>
                        <For each={[...Array(character().spells_info.spells_slots[level] - (character().spent_spell_slots[level] || 0)).keys()]}>
                          {() => <Checkbox filled classList="mr-1" onToggle={() => spendSpellSlot(level)} />}
                        </For>
                      </div>
                    </Show>
                    <Show when={character().spells_info?.prepare && !renderMode()}>
                      <p class="dark:text-snow">
                        {localize(TRANSLATION, locale()).prepareSlots} {level === 0 ? character().spells_info.cantrip_slots : character().spells_info.spells_slots[level]}
                      </p>
                    </Show>
                  </div>
                  <Show when={character().spells_info}>
                    <Show
                      when={character().spells_info.prepare && !renderMode()}
                      fallback={
                        <Show
                          when={groupedCharacterSpells()[level] && groupedCharacterSpells()[level].filter((item) => item.value[level].selected_count !== 0).length > 0}
                          fallback={<p class="dark:text-snow mb-4">
                            {character().spells_info.prepare ? localize(TRANSLATION, locale()).noPreparedSpells : localize(TRANSLATION, locale()).noSpells}</p>
                          }
                        >
                          {/* если спонтанный заклинатель (Бард) или включен режим отображения */}
                          <div class="flex flex-col gap-2 mb-4">
                            <For each={groupedCharacterSpells()[level].filter((item) => item.value[level].selected_count !== 0)}>
                              {(characterSpell) =>
                                <Pathfinder2Spell
                                  noLevel
                                  spell={characterSpell.spell}
                                  cantripLevel={Math.round(character().level / 2)}
                                  level={level}
                                >
                                  <Show when={character().spells_info.prepare && characterSpell.spell.info.level > 0}>
                                    {/* Ячейки заклинаний подготавливающих заклинателей */}
                                    <div class="flex">
                                      <For each={[...Array((characterSpell.value[level].used_count || 0)).keys()]}>
                                        {() => <Checkbox filled checked classList="mr-1" onToggle={(e) => unuseSpellSlot(e, characterSpell, level)} />}
                                      </For>
                                      <For each={[...Array(characterSpell.value[level].selected_count - (characterSpell.value[level].used_count || 0)).keys()]}>
                                        {() => <Checkbox filled classList="mr-1" onToggle={(e) => useSpellSlot(e, characterSpell, level)} />}
                                      </For>
                                    </div>
                                  </Show>
                                </Pathfinder2Spell>
                              }
                            </For>
                          </div>
                        </Show>
                      }
                    >
                      {/* если включен режим подготовки */}
                      <div class="flex flex-col gap-2 mb-4">
                        <For each={preparedCharacterSpells()[level]}>
                          {(characterSpell) =>
                            <Pathfinder2Spell
                              noLevel
                              prepareMode
                              spell={characterSpell.spell}
                            >
                              <Show
                                when={characterSpell.spell.info.level > 0}
                                fallback={
                                  <div class="flex flex-col">
                                    <Checkbox
                                      checked={characterSpell.ready_to_use}
                                      onToggle={(e) => characterSpell.ready_to_use ? disableSpell(e, characterSpell, 0, 0) : enableSpell(e, characterSpell, 1, 0)}
                                    />
                                  </div>
                                }
                              >
                                <div class="flex flex-col gap-2">
                                  <For each={Object.entries(character().spells_info.spells_slots)}>
                                    {([level,]) =>
                                      <div class="flex gap-2">
                                        <span>{level} - </span>
                                        <Button default size="small" onClick={(e) => characterSpell.value[level]?.selected_count === 0 ? null : disableSpell(e, characterSpell, characterSpell.value[level]?.selected_count - 1, level)}>
                                          <Minus />
                                        </Button>
                                        <p>{characterSpell.value[level]?.selected_count || 0}</p>
                                        <Button default size="small" onClick={(e) => enableSpell(e, characterSpell, (characterSpell.value[level]?.selected_count || 0) + 1, level)}>
                                          <PlusSmall />
                                        </Button>
                                      </div>
                                    }
                                  </For>
                                </div>
                              </Show>
                            </Pathfinder2Spell>
                          }
                        </For>
                      </div>
                    </Show>
                  </Show>
                  <Show when={renderMode() && groupedStaticSpells()[level]}>
                    <div class="flex flex-col gap-2 mb-4">
                      <For each={groupedStaticSpells()[level]}>
                        {(characterSpell) =>
                          <Pathfinder2Spell
                            innate
                            noLevel
                            spell={characterSpell.spell}
                            spellAttack={characterSpell.spell_attack}
                            spellDc={characterSpell.spell_dc}
                            limit={characterSpell.limit}
                            onOpenDiceRoll={props.openDiceRoll}
                            cantripLevel={Math.round(character().level / 2)}
                          />
                        }
                      </For>
                    </div>
                  </Show>
                </>
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
