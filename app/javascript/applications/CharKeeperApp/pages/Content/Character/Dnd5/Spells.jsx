import { createSignal, createEffect, For, Show, createMemo, batch, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { SpellsTable } from './SpellsTable';
import { StatsBlock, ErrorWrapper, Button, Toggle, Checkbox, Select } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { Plus, Minus } from '../../../../assets';
import { fetchSpellsRequest } from '../../../../requests/fetchSpellsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';
import { createCharacterSpellRequest } from '../../../../requests/createCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../../requests/updateCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../../requests/removeCharacterSpellRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const DND5_CLASSES_LEARN_SPELLS = ['bard', 'ranger', 'sorcerer', 'warlock', 'wizard'];
const DND5_CLASSES_PREPARE_SPELLS = ['cleric', 'druid', 'paladin', 'artificer', 'wizard'];
const DND2024_CLASSES_LEARN_SPELLS = ['wizard'];
const DND2024_CLASSES_PREPARE_SPELLS = [
  'bard', 'ranger', 'sorcerer', 'warlock', 'cleric', 'druid', 'paladin', 'artificer', 'wizard'
];

export const Dnd5Spells = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [characterSpells, setCharacterSpells] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [spentSpellSlots, setSpentSpellSlots] = createSignal(undefined);
  const [activeSpellClass, setActiveSpellClass] = createSignal(undefined);

  const [spellsSelectingMode, setSpellsSelectingMode] = createSignal(false);
  const [availableSpellFilter, setAvailableSpellFilter] = createSignal(true);
  const [preparedSpellFilter, setPreparedSpellFilter] = createSignal(true);

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const spellClassesList = createMemo(() => Object.keys(character().spell_classes));

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;
    if (spellClassesList().length === 0) return;

    const spellLevels = Object.keys(character().spells_slots);

    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      props.character.provider,
      { max_level: spellLevels.length === 0 ? 0 : Math.max(...spellLevels) }
    );
    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(
      appState.accessToken, character().provider, character().id
    );

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells.sort((a, b) => a.name > b.name));
          setSpentSpellSlots(character().spent_spell_slots);
          setActiveSpellClass(Object.keys(character().spell_classes)[0]);
          setLastActiveCharacterId(character().id);
          setSpellsSelectingMode(false);
        });
      }
    );
  });

  const filteredSpellsList = createMemo(() => {
    if (lastActiveCharacterId() !== character().id) return [];
    if (spellClassesList().length === 0) return [];

    const maxSpellLevel = character().spell_classes[activeSpellClass()].max_spell_level;

    return spells().filter((item) => {
      if (item.level > maxSpellLevel) return false;
      if (!availableSpellFilter()) return true;

      return item.available_for.includes(activeSpellClass());
    });
  });

  const filteredCharacterSpells = createMemo(() => {
    if (lastActiveCharacterId() !== character().id) return [];
    if (spellClassesList().length === 0) return [];

    return characterSpells().filter((item) => {
      if (item.prepared_by !== activeSpellClass()) return false;
      if (preparedSpellFilter()) return item.ready_to_use;
      if (Object.keys(character().static_spells).includes(item.slug)) return false;
      return true;
    });
  });

  const knownSpellIds = createMemo(() => {
    if (lastActiveCharacterId() !== character().id) return [];
    if (spellClassesList().length === 0) return [];

    return characterSpells().map(({ spell_id }) => spell_id);
  });

  const canPrepareSpells = createMemo(() => {
    return character().provider === 'dnd5' ? DND5_CLASSES_PREPARE_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_PREPARE_SPELLS.includes(activeSpellClass());
  });

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(
      appState.accessToken,
      props.character.provider,
      props.character.id,
      { spell_id: spellId, target_spell_class: targetSpellClass }
    );
    if (result.errors === undefined) setCharacterSpells(characterSpells().concat(result.spell));
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId);
    if (result.errors === undefined) setCharacterSpells(characterSpells().filter((item) => item.spell_id !== spellId));
  }

  const enableSpell = (spellId) => updateCharacterSpell(spellId, { 'ready_to_use': true });
  const disableSpell = (spellId) => updateCharacterSpell(spellId, { 'ready_to_use': false });

  const spendSpellSlot = async (level) => {
    let newValue;
    if (spentSpellSlots()[level]) {
      newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] + 1 };
    } else {
      newValue = { ...spentSpellSlots(), [level]: 1 };
    }

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { spent_spell_slots: newValue }, only_head: true }
    );
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const freeSpellSlot = async (level) => {
    const newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] - 1 };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { spent_spell_slots: newValue }, only_head: true }
    );
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const updateCharacterSpell = async (spellId, payload) => {
    const result = await updateCharacterSpellRequest(
      appState.accessToken, character().provider, character().id, spellId, payload
    );

    if (result.errors === undefined) {
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
      <Show
        when={!spellsSelectingMode() || spellClassesList().length === 0}
        fallback={
          <>
            <div class="flex justify-between items-center mb-2">
              <Checkbox
                labelText={t('character.onlyAvailableSpells')}
                labelPosition="right"
                labelClassList="ml-2"
                checked={availableSpellFilter()}
                onToggle={() => setAvailableSpellFilter(!availableSpellFilter())}
              />
              <Show when={spellClassesList().length > 1}>
                <Select
                  classList="w-40"
                  items={spellClassesList().reduce((acc, item) => { acc[item] = t(`dnd5.classes.${item}`); return acc; }, {})}
                  selectedValue={activeSpellClass()}
                  onSelect={(value) => setActiveSpellClass(value)}
                />
              </Show>
            </div>
            <For each={[0].concat(Object.keys(character().spells_slots).map((item) => parseInt(item)))}>
              {(level) =>
                <Toggle title={level === 0 ? t('terms.cantrips') : `${level} ${t('spellbookPage.level')}`}>
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
                                  <Show when={knownSpellIds().includes(spell.id)}>
                                    <p class="text-xs mt-1">
                                      {t(`dnd5.classes.${characterSpells().find((item) => item.spell_id === spell.id).prepared_by}`)}
                                    </p>
                                  </Show>
                                }
                              >
                                <p class="text-xs text-wrap">
                                  {spell.available_for.map((item) => dict().dnd5.classes[item]).join(' * ')}
                                </p>
                              </Show>
                            </td>
                            <td>
                              <Show
                                when={knownSpellIds().includes(spell.id)}
                                fallback={
                                  <Button default size="small" onClick={() => learnSpell(spell.id, activeSpellClass())}>
                                    <Plus width={20} height={20} />
                                  </Button>
                                }
                              >
                                <Button default size="small" onClick={() => forgetSpell(spell.id)}>
                                  <Minus width={20} height={20} />
                                </Button>
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
            <Button default textable onClick={() => setSpellsSelectingMode(false)}>{t('back')}</Button>
          </>
        }
      >
        <Switch>
          <Match when={spellClassesList().length === 0}>
            <div class="p-4 flex blockable dark:text-snow">
              <p>{t('character.no_magic')}</p>
            </div>
          </Match>
          <Match when={spells() === undefined}>
            <span>1</span>
          </Match>
          <Match when={spells() !== undefined}>
            <div class="flex justify-between items-center mb-2">
              <Checkbox
                labelText={t('character.onlyPreparedSpells')}
                labelPosition="right"
                labelClassList="ml-2"
                checked={preparedSpellFilter()}
                onToggle={() => setPreparedSpellFilter(!preparedSpellFilter())}
              />
              <Show when={spellClassesList().length > 1}>
                <Select
                  classList="w-40"
                  items={spellClassesList().reduce((acc, item) => { acc[item] = t(`dnd5.classes.${item}`); return acc; }, {})}
                  selectedValue={activeSpellClass()}
                  onSelect={(value) => setActiveSpellClass(value)}
                />
              </Show>
            </div>
            <Show when={lastActiveCharacterId() === character().id}>
              <StatsBlock
                items={[
                  { title: t('terms.spellAttack'), value: modifier(character().spell_classes[activeSpellClass()].attack_bonus) },
                  { title: t('terms.saveDC'), value: character().spell_classes[activeSpellClass()].save_dc }
                ]}
              />
              <div class="mb-2 p-4 flex blockable">
                <div class="flex-1 flex flex-col items-center dark:text-snow">
                  <p class="uppercase text-xs mb-1">{t('terms.cantrips')}</p>
                  <p class="text-2xl mb-1">
                    {character().spell_classes[activeSpellClass()].cantrips_amount}
                  </p>
                </div>
                <Show when={character().provider === 'dnd5'}>
                  <div class="flex-1 flex flex-col items-center dark:text-snow">
                    <p class="uppercase text-xs mb-1">{t('terms.known')}</p>
                    <p class="text-2xl mb-1 flex gap-2 items-start">
                      <Show
                        when={character().spell_classes[activeSpellClass()].spells_amount}
                        fallback={<span>-</span>}
                      >
                        <span>{character().spell_classes[activeSpellClass()].spells_amount}</span>
                      </Show>
                      <span class="text-sm">{character().spell_classes[activeSpellClass()].max_spell_level} {t('spellbookPage.level')}</span>
                    </p>
                  </div>
                </Show>
                <div class="flex-1 flex flex-col items-center dark:text-snow">
                  <p class="uppercase text-xs mb-1">{t('terms.prepared')}</p>
                  <p class="text-2xl mb-1">
                    {character().spell_classes[activeSpellClass()].prepared_spells_amount}
                  </p>
                </div>
              </div>
            </Show>
            <Show when={character().provider === 'dnd5' ? DND5_CLASSES_LEARN_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_LEARN_SPELLS.includes(activeSpellClass())}>
              <Button default textable classList="mb-2" onClick={() => setSpellsSelectingMode(true)}>
                {t('character.knownSpells')}
              </Button>
            </Show>
            <SpellsTable
              level="0"
              spells={filteredCharacterSpells().filter((item) => item.level === 0)}
              canPrepareSpells={canPrepareSpells()}
              onEnableSpell={enableSpell}
              onDisableSpell={disableSpell}
            />
            <For each={Object.entries(character().spells_slots)}>
              {([level, slotsAmount]) =>
                <SpellsTable
                  level={level}
                  spells={filteredCharacterSpells().filter((item) => item.level === parseInt(level))}
                  spentSpellSlots={spentSpellSlots()}
                  canPrepareSpells={canPrepareSpells()}
                  slotsAmount={slotsAmount}
                  onEnableSpell={enableSpell}
                  onDisableSpell={disableSpell}
                  onSpendSpellSlot={spendSpellSlot}
                  onFreeSpellSlot={freeSpellSlot}
                />
              }
            </For>
          </Match>
        </Switch>
      </Show>
    </ErrorWrapper>
  );
}
