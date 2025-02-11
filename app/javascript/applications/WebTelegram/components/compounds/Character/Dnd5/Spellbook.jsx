import { createSignal, For, Show, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { StatsBlock } from '../../../molecules';
import { Select, Checkbox } from '../../../atoms';

import { useAppLocale } from '../../../../context';

import { modifier } from '../../../../../../helpers';

const CLASSES_LEARN_SPELLS = ['bard', 'ranger', 'sorcerer', 'warlock', 'wizard'];
const CLASSES_PREPARE_SPELLS = ['cleric', 'druid', 'paladin', 'artificer', 'wizard'];

export const Dnd5Spellbook = (props) => {
  const [preparedSpellFilter, setPreparedSpellFilter] = createSignal(true);
  const [activeSpellClass, setActiveSpellClass] = createSignal(props.initialSpellClassesList[0]);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // memos
  const filteredCharacterSpells = createMemo(() => {
    if (props.characterSpells === undefined) return [];

    const result = props.characterSpells.filter((item) => {
      if (activeSpellClass() !== 'all' && item.prepared_by !== activeSpellClass()) return false;
      if (preparedSpellFilter()) return item.ready_to_use;
      if (props.staticCharacterSpells.includes(item.slug)) return false;
      return true;
    });
    return Object.groupBy(result, ({ level }) => level);
  });

  const staticCharacterSpells = createMemo(() => {
    if (props.spells === undefined) return [];
    if (props.staticCharacterSpells.length === 0) return [];

    const result = props.spells.filter((item) => props.staticCharacterSpells.includes(item.slug));
    return Object.groupBy(result, ({ level }) => level);
  });

  // actions

  // rendering
  return (
    <>
      <div class="flex justify-between items-center mb-2">
        <Checkbox
          labelText={t('character.onlyPreparedSpells')}
          labelPosition="right"
          labelClassList="ml-2"
          checked={preparedSpellFilter()}
          onToggle={() => setPreparedSpellFilter(!preparedSpellFilter())}
        />
        <Show when={props.initialSpellClassesList.length > 1}>
          <Select
            classList="w-40"
            items={props.initialSpellClassesList.reduce((acc, item) => { acc[item] = t(`classes.${item}`); return acc; }, { 'all': t('character.allSpells') })}
            selectedValue={activeSpellClass()}
            onSelect={(value) => setActiveSpellClass(value)}
          />
        </Show>
      </div>
      <Show when={activeSpellClass() !== 'all'}>
        <StatsBlock
          items={[
            { title: t('terms.spellAttack'), value: modifier(props.spellClasses[activeSpellClass()].attack_bonus) },
            { title: t('terms.saveDC'), value: props.spellClasses[activeSpellClass()].save_dc }
          ]}
        />
        <div class="mb-2 p-4 flex white-box">
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('terms.cantrips')}</p>
            <p class="text-2xl mb-1">
              {props.spellClasses[activeSpellClass()].cantrips_amount}
            </p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('terms.known')}</p>
            <p class="text-2xl mb-1 flex gap-2 items-start">
              <Show
                when={props.spellClasses[activeSpellClass()].spells_amount}
                fallback={<span>-</span>}
              >
                <span>{props.spellClasses[activeSpellClass()].spells_amount}</span>
              </Show>
              <span class="text-sm">{props.spellClasses[activeSpellClass()].max_spell_level} {t('spellbookPage.level')}</span>
            </p>
          </div>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('terms.prepared')}</p>
            <p class="text-2xl mb-1">
              {props.spellClasses[activeSpellClass()].prepared_spells_amount}
            </p>
          </div>
        </div>
      </Show>
      <Show when={CLASSES_LEARN_SPELLS.includes(activeSpellClass())}>
        <button
          class="btn-primary mb-2"
          onClick={props.onNavigatoToSpells} // eslint-disable-line solid/reactivity
        >{t('character.knownSpells')}</button>
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
            <For each={staticCharacterSpells()['0']}>
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
            <For each={filteredCharacterSpells()[0]}>
              {(spell) =>
                <tr>
                  <td class="py-1">
                    <p class={`${spell.ready_to_use ? '' : 'opacity-50'}`}>
                      {spell.name}
                    </p>
                    <Show when={props.spellClasses.length > 1 && activeSpellClass() === 'all'}>
                      <p class="text-xs">{t(`classes.${spell.prepared_by}`)}</p>
                    </Show>
                  </td>
                  <td>
                    <Show when={CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
                      <Show
                        when={spell.ready_to_use}
                        fallback={<span class="cursor-pointer" onClick={() => props.onPrepareSpell(spell.id)}>Prepare</span>}
                      >
                        <span class="cursor-pointer" onClick={() => props.onDisableSpell(spell.id)}>Disable</span>
                      </Show>
                    </Show>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
      <For each={Object.entries(props.spellSlots)}>
        {([level, slotsAmount]) =>
          <div class="white-box mb-2 p-4">
            <div class="flex justify-between items-center">
              <h2 class="text-lg">{level} {t('spellbookPage.level')}</h2>
              <div class="flex">
                <For each={[...Array((props.spentSpellSlots[level] || 0)).keys()]}>
                  {() =>
                    <p
                      class="w-6 h-6 rounded bg-black mr-1 cursor-pointer"
                      onClick={() => props.onFreeSpellSlot(level)}
                    />
                  }
                </For>
                <For each={[...Array(slotsAmount - (props.spentSpellSlots[level] || 0)).keys()]}>
                  {() =>
                    <p
                      class="w-6 h-6 rounded border-2 border-black mr-1 cursor-pointer"
                      onClick={() => props.onSpendSpellSlot(level)}
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
                <For each={staticCharacterSpells()[level]}>
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
                <For each={filteredCharacterSpells()[level]}>
                  {(spell) =>
                    <tr>
                      <td class="py-1">
                        <p class={`${spell.ready_to_use ? '' : 'opacity-50'}`}>
                          {spell.name}
                        </p>
                        <Show when={props.initialSpellClassesList.length > 1 && activeSpellClass() === 'all'}>
                          <p class="text-xs">{t(`classes.${spell.prepared_by}`)}</p>
                        </Show>
                      </td>
                      <td>
                        <Show when={CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
                          <Show
                            when={spell.ready_to_use}
                            fallback={<span class="cursor-pointer" onClick={() => props.onPrepareSpell(spell.id)}>Prepare</span>}
                          >
                            <span class="cursor-pointer" onClick={() => props.onDisableSpell(spell.id)}>Disable</span>
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
    </>
  );
}
