import { createSignal, For, Show, createMemo, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Select, Checkbox, Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';

import { modifier } from '../../../../../../helpers';

const DND5_CLASSES_LEARN_SPELLS = ['bard', 'ranger', 'sorcerer', 'warlock', 'wizard'];
const DND5_CLASSES_PREPARE_SPELLS = ['cleric', 'druid', 'paladin', 'artificer', 'wizard'];
const DND2024_CLASSES_LEARN_SPELLS = ['wizard'];
const DND2024_CLASSES_PREPARE_SPELLS = [
  'bard', 'ranger', 'sorcerer', 'warlock', 'cleric', 'druid', 'paladin', 'artificer', 'wizard'
];

export const Dnd5Spellbook = (props) => {
  const [preparedSpellFilter, setPreparedSpellFilter] = createSignal(true);
  const [activeSpellClass, setActiveSpellClass] = createSignal(props.initialSpellClassesList[0]);
  const [changingSpell, setChangingSpell] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // actions
  const changeSpell = (item) => {
    batch(() => {
      setChangingSpell(item);
      openModal();
    });
  }

  // memos
  const filteredCharacterSpells = createMemo(() => {
    if (props.characterSpells === undefined) return [];

    return props.characterSpells.filter((item) => {
      if (activeSpellClass() !== 'all' && item.prepared_by !== activeSpellClass()) return false;
      if (preparedSpellFilter()) return item.ready_to_use;
      if (Object.keys(props.staticCharacterSpells).includes(item.slug)) return false;
      return true;
    });
  });

  const staticCharacterSpells = createMemo(() => {
    if (props.spells === undefined) return [];
    if (props.staticCharacterSpells.length === 0) return [];

    const staticSpells = props.spells.filter((item) => Object.keys(props.staticCharacterSpells).includes(item.slug));
    return Object.entries(props.staticCharacterSpells).map(([slug, item]) => {
      const spell = staticSpells.find((item) => item.slug === slug);
      return { slug: slug, name: spell.name, level: spell.level, data: item }
    });
  });

  const updateSpell = async () => {
    const result = await props.onUpdateSpellNotes(
      changingSpell().id,
      changingSpell().notes
    );

    if (result.errors === undefined) closeModal();
  }

  // rendering
  const renderStaticSpellDescription = (spell) => {
    const result = [t('character.staticSpell')];
    if (spell.data.limit) result.push(`${spell.data.limit} ${t('character.staticSpellPerDay')}`);
    if (spell.data.level) result.push(`${t('character.staticSpellLevel')} ${spell.data.level}`);
    if (spell.data.attack_bonus) result.push(`${t('character.staticSpellAttackBonus')} ${modifier(spell.data.attack_bonus)}`);
    if (spell.data.save_dc) result.push(`${t('character.staticSpellSaveDC')} ${spell.data.save_dc}`);

    return result.join(', ');
  }

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
            items={props.initialSpellClassesList.reduce((acc, item) => { acc[item] = t(`dnd5.classes.${item}`); return acc; }, { 'all': t('character.allSpells') })}
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
          <Show when={props.provider === 'dnd5'}>
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
          </Show>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{t('terms.prepared')}</p>
            <p class="text-2xl mb-1">
              {props.spellClasses[activeSpellClass()].prepared_spells_amount}
            </p>
          </div>
        </div>
      </Show>
      <Show when={props.provider === 'dnd5' ? DND5_CLASSES_LEARN_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_LEARN_SPELLS.includes(activeSpellClass())}>
        <Button primary classList="mb-2" text={t('character.knownSpells')} onClick={props.onNavigatoToSpells} />
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
            <For each={staticCharacterSpells().filter((item) => item.level === 0)}>
              {(spell) =>
                <tr>
                  <td class="py-1">
                    <p>
                      {spell.name}
                    </p>
                    <p class="text-xs">{renderStaticSpellDescription(spell)}</p>
                  </td>
                  <td />
                </tr>
              }
            </For>
            <For each={filteredCharacterSpells().filter((item) => item.level === 0)}>
              {(spell) =>
                <tr>
                  <td class="py-1">
                    <p
                      class={`cursor-pointer ${spell.ready_to_use ? '' : 'opacity-50'}`}
                      onClick={() => changeSpell(spell)}
                    >
                      {spell.name}
                    </p>
                    <Show when={props.spellClasses.length > 1 && activeSpellClass() === 'all'}>
                      <p class="text-xs">{t(`dnd5.classes.${spell.prepared_by}`)}</p>
                    </Show>
                    <Show when={spell.notes !== null}>
                      <p class="text-xs">{spell.notes}</p>
                    </Show>
                  </td>
                  <td>
                    <Show when={props.provider === 'dnd5' ? DND5_CLASSES_PREPARE_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
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
                    <Checkbox
                      checked
                      classList="mr-1"
                      onToggle={() => props.onFreeSpellSlot(level)}
                    />
                  }
                </For>
                <For each={[...Array(slotsAmount - (props.spentSpellSlots[level] || 0)).keys()]}>
                  {() =>
                    <Checkbox
                      classList="mr-1"
                      onToggle={() => props.onSpendSpellSlot(level)}
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
                <For each={staticCharacterSpells().filter((item) => item.level === parseInt(level))}>
                  {(spell) =>
                    <tr>
                      <td class="py-1">
                        <p>
                          {spell.name}
                        </p>
                        <p class="text-xs">{renderStaticSpellDescription(spell)}</p>
                      </td>
                      <td />
                    </tr>
                  }
                </For>
                <For each={filteredCharacterSpells().filter((item) => item.level === parseInt(level))}>
                  {(spell) =>
                    <tr>
                      <td class="py-1">
                        <p
                          class={`cursor-pointer ${spell.ready_to_use ? '' : 'opacity-50'}`}
                          onClick={() => changeSpell(spell)}
                        >
                          {spell.name}
                        </p>
                        <Show when={props.initialSpellClassesList.length > 1 && activeSpellClass() === 'all'}>
                          <p class="text-xs">{t(`dnd5.classes.${spell.prepared_by}`)}</p>
                        </Show>
                        <Show when={spell.notes !== null}>
                          <p class="text-xs">{spell.notes}</p>
                        </Show>
                      </td>
                      <td>
                        <Show when={props.provider === 'dnd5' ? DND5_CLASSES_PREPARE_SPELLS.includes(activeSpellClass()) : DND2024_CLASSES_PREPARE_SPELLS.includes(activeSpellClass())}>
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
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <label class="text-sm">{t('character.spellNote')}</label>
          <textarea
            rows="3"
            class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
            onInput={(e) => setChangingSpell({ ...changingSpell(), notes: e.target.value })}
            value={changingSpell()?.notes}
          />
          <Button primary text={t('save')} onClick={updateSpell} />
        </div>
      </Modal>
    </>
  );
}
