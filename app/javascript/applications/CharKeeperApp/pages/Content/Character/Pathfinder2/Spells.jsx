import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Pathfinder2SpellBook, Pathfinder2Spell } from '../../../../pages';
import { StatsBlock, ErrorWrapper, Button, GuideWrapper, Dice, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
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
    prepareSlots: 'Prepare slots'
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
    prepareSlots: 'Ячейки для подготовки'
  }
}

export const Pathfinder2Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [spells, setSpells] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);

  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [renderMode, setRenderMode] = createSignal(true);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchSpells = async () => await fetchSpellsRequest(
    appState.accessToken,
    character().provider,
    { max_level: character().spells_info.max_spell_level }
  );
  const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    if (character().spells_info) {
      Promise.all([fetchSpells(), fetchCharacterSpells()]).then(
        ([spellsData, characterSpellsData]) => {
          batch(() => {
            setSpells(spellsData.spells);
            setCharacterSpells(characterSpellsData.spells);
          });
        }
      );
    } else {
      batch(() => {
        setSpells([]);
        setCharacterSpells([]);
      });
    }

    batch(() => {
      setLastActiveCharacterId(character().id);
      setSpellsSelectingMode(false);
    });
  });

  const groupedCharacterSpells = createMemo(() => {
    if (!characterSpells()) return {};

    return characterSpells().reduce((acc, item) => {
      const currentLevel = item.spell.info.level
      acc[currentLevel] = acc[currentLevel] ? acc[currentLevel].concat(item) : [item];

      return acc;
    }, {});
  });

  const groupedStaticSpells = createMemo(() => {
    if (character().formatted_static_spells.length === 0) return {};

    return character().formatted_static_spells.reduce((acc, item) => {
      const currentLevel = item.spell.info.level
      acc[currentLevel] = acc[currentLevel] ? acc[currentLevel].concat(item) : [item];

      return acc;
    }, {});
  });

  const maxSpellLevel = createMemo(() => {
    const spellsMaxLevel = character().spells_info ? character().spells_info.max_spell_level : 0;

    const formattedLevels = character().formatted_static_spells.length > 0 ? character().formatted_static_spells.map((item) => item.spell.info.level) : [0]
    const staticMaxLevel = Math.max(...formattedLevels);

    return Math.max(spellsMaxLevel, staticMaxLevel);
  });

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

  const enableSpell = (spellId, counter, spellLevel) => {
    const totalSlots = spellLevel === 0 ? character().spells_info.cantrip_slots : character().spells_info.spells_slots[spellLevel];

    let activeSpellSlots = counter;
    if (groupedCharacterSpells()[spellLevel]) {
      activeSpellSlots += groupedCharacterSpells()[spellLevel].reduce((acc, item) => {
        if (item.id === spellId) return acc;

        acc += item.selected_count;
        return acc;
      }, 0);
    }
    if (activeSpellSlots > totalSlots) return;

    updateCharacterSpell(spellId, { ready_to_use: true, selected_count: counter });
  }

  const disableSpell = (spellId, counter) => {
    if (counter === 0) updateCharacterSpell(spellId, { ready_to_use: false, selected_count: 0, used_count: 0 });
    else updateCharacterSpell(spellId, { ready_to_use: true, selected_count: counter });
  }

  const unuseSpellSlot = (e, spell) => {
    e.stopPropagation();
    if (spell.used_count === 0) return;

    updateCharacterSpell(spell.id, { used_count: spell.used_count - 1 });
  }

  const useSpellSlot = (e, spell) => {
    e.stopPropagation();
    if (spell.used_count >= spell.selected_count) return;

    updateCharacterSpell(spell.id, { used_count: spell.used_count + 1 });
  }

  const updateCharacterSpell = async (spellId, payload) => {
    const result = await updateCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spellId, { spell: payload, only_head: true }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          const newValue = characterSpells().slice().map((element) => {
            if (element.id !== spellId) return element;
            return { ...element, ...payload }
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
            when={!spellsSelectingMode()}
            fallback={
              <Pathfinder2SpellBook
                character={character()}
                spells={spells()}
                characterSpells={characterSpells()}
                onSetCharacterSpells={setCharacterSpells}
                onBack={() => setSpellsSelectingMode(false)}
              />
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
                  { title: localize(TRANSLATION, locale()).saveDC, value: character().spell_dc }
                ]}
              />
              <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
                {localize(TRANSLATION, locale()).gotoSpellBook}
              </Button>
              <Show when={character().spells_info.prepare}>
                <Checkbox
                  labelText={localize(TRANSLATION, locale()).renderMode}
                  labelPosition="right"
                  labelClassList="ml-2"
                  classList="mb-2"
                  checked={!renderMode()}
                  onToggle={() => setRenderMode(!renderMode())}
                />
              </Show>
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
                    <Show when={character().spells_info && level !== 0 && !character().spells_info.prepare}>
                      <div class="flex">
                        <For each={[...Array((character().spent_spell_slots[props.level] || 0)).keys()]}>
                          {() => <Checkbox filled checked classList="mr-1" onToggle={() => freeSpellSlot(props.level)} />}
                        </For>
                        <For each={[...Array(character().spells_info.spells_slots[level] - (character().spent_spell_slots[props.level] || 0)).keys()]}>
                          {() => <Checkbox filled classList="mr-1" onToggle={() => spendSpellSlot(props.level)} />}
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
                          when={groupedCharacterSpells()[level] && groupedCharacterSpells()[level].filter((item) => item.ready_to_use).length > 0}
                          fallback={<p class="dark:text-snow mb-4">
                            {character().spells_info.prepare ? localize(TRANSLATION, locale()).noPreparedSpells : localize(TRANSLATION, locale()).noSpells}</p>
                          }
                        >
                          {/* если не надо подготавливать (Бард) или включен режим отображения */}
                          <div class="flex flex-col gap-2 mb-4">
                            <For each={groupedCharacterSpells()[level].filter((item) => item.ready_to_use)}>
                              {(characterSpell) =>
                                <Pathfinder2Spell
                                  noLevel
                                  prepareMode={false}
                                  spell={characterSpell.spell}
                                  selectedCount={characterSpell.selected_count}
                                  usedCount={characterSpell.used_count}
                                >
                                  <Show when={characterSpell.spell.info.level > 0}>
                                    <div class="flex">
                                      <For each={[...Array(characterSpell.used_count).keys()]}>
                                        {() => <Checkbox filled checked classList="mr-1" onToggle={(e) => unuseSpellSlot(e, characterSpell)} />}
                                      </For>
                                      <For each={[...Array(characterSpell.selected_count - characterSpell.used_count).keys()]}>
                                        {() => <Checkbox filled classList="mr-1" onToggle={(e) => useSpellSlot(e, characterSpell)} />}
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
                      {/* если надо подготавливать и включен режим подготовки */}
                      <div class="flex flex-col gap-2 mb-4">
                        <For each={groupedCharacterSpells()[level]}>
                          {(characterSpell) =>
                            <Pathfinder2Spell
                              noLevel
                              prepareMode={true}
                              characterSpellId={characterSpell.id}
                              spell={characterSpell.spell}
                              readyToUse={characterSpell.ready_to_use}
                              selectedCount={characterSpell.selected_count}
                              onDisableSpell={disableSpell}
                              onEnableSpell={enableSpell}
                            />
                          }
                        </For>
                      </div>
                    </Show>
                  </Show>
                  <Show when={groupedStaticSpells()[level]}>
                    <div class="flex flex-col gap-2 mb-4">
                      <For each={groupedStaticSpells()[level]}>
                        {(characterSpell) =>
                          <Pathfinder2Spell
                            innate
                            noLevel
                            prepareMode={false}
                            spell={characterSpell.spell}
                            spellAttack={characterSpell.spell_attack}
                            spellDc={characterSpell.spell_dc}
                            limit={characterSpell.limit}
                            onOpenDiceRoll={props.openDiceRoll}
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
