import { createSignal, For, Show, batch } from 'solid-js';

import { SpellCastTime, SpellRange, SpellAttack, SpellComponents, SpellDuration, SpellEffects } from '../../../../pages';
import { Button, Checkbox, createModal, TextArea } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { Minus, Plus } from '../../../../assets';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    attackBonus: 'attack bonus',
    saveDC: 'save DC',
    perDay: 'per day',
    spellLevel: 'as level',
    cantrips: 'Cantrips',
    level: 'level',
    spellNote: 'Spell note',
    static: 'Static',
    save: 'Save'
  },
  ru: {
    attackBonus: 'бонус атаки',
    saveDC: 'УС',
    perDay: 'раз в день',
    spellLevel: 'как на уровне',
    cantrips: 'Заговоры',
    level: 'уровень',
    spellNote: 'Заметка о заклинании',
    static: 'Врождённое',
    save: 'Сохранить'
  }
}

export const SpellsTable = (props) => {
  const [changingSpell, setChangingSpell] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [locale] = useAppLocale();

  const renderSpellData = (data) => {
    const result = [];
    if (data.limit) result.push(`${data.limit} ${TRANSLATION[locale()]['perDay']}`);
    if (data.level) result.push(`${TRANSLATION[locale()]['spellLevel']} ${data.level}`);

    return result.join(', ');
  }

  const changeSpell = (spell) => {
    batch(() => {
      setChangingSpell(spell);
      openModal();
    });
  }

  const updateSpell = () => {
    props.onUpdateCharacterSpell(changingSpell().id, { notes: changingSpell().notes });
    closeModal();
  }

  return (
    <>
      <div class="blockable mb-2 p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg mb-4">
            <Show when={props.level !== 0} fallback={TRANSLATION[locale()]['cantrips']}>
              {props.level} {TRANSLATION[locale()]['level']}
            </Show>
          </h2>
          <Show when={props.spentSpellSlots}>
            <div class="flex">
              <For each={[...Array((props.spentSpellSlots[props.level] || 0)).keys()]}>
                {() =>
                  <Checkbox filled checked classList="mr-1" onToggle={() => props.onFreeSpellSlot(props.level)} />
                }
              </For>
              <For each={[...Array(props.slotsAmount - (props.spentSpellSlots[props.level] || 0)).keys()]}>
                {() =>
                  <Checkbox filled classList="mr-1" onToggle={() => props.onSpendSpellSlot(props.level)} />
                }
              </For>
            </div>
          </Show>
        </div>
        <div class="dnd2024-spells">
          <For each={props.spells}>
            {(characterSpell) =>
              <div class="dnd2024-spell">
                <div class="dnd2024-spell-header">
                  <div>
                    <p class="dnd2024-spell-title" onClick={() => characterSpell.data ? null : changeSpell(characterSpell)}>
                      {characterSpell.spell.title}
                    </p>
                  </div>
                  <div>
                    <Show when={!characterSpell.data && props.canPrepareSpells}>
                      <Show
                        when={characterSpell.ready_to_use}
                        fallback={
                          <Button default size="small" onClick={() => props.onEnableSpell(characterSpell.id)}>
                            <Plus width={20} height={20} />
                          </Button>
                        }
                      >
                        <Button default size="small" onClick={() => props.onDisableSpell(characterSpell.id)}>
                          <Minus width={20} height={20} />
                        </Button>
                      </Show>
                    </Show>
                  </div>
                </div>
                <Show when={props.activeSpellClass === undefined}>
                  <p class="text-xs">
                    {characterSpell.prepared_by ? config.classes[characterSpell.prepared_by]['name'][locale()] : TRANSLATION[locale()]['static']}
                  </p>
                </Show>
                <div class="dnd2024-spell-tooltips">
                  <SpellCastTime value={characterSpell.spell.time} ritual={characterSpell.spell.ritual} />
                  <SpellRange value={characterSpell.spell.range} />
                  <SpellAttack
                    withDice
                    hit={characterSpell.spell.hit}
                    dc={characterSpell.spell.dc}
                    character={props.character}
                    activeSpellClass={props.activeSpellClass || characterSpell.prepared_by}
                    openDiceRoll={props.openDiceRoll}
                    alterHit={characterSpell.spell.data?.attack_bonus}
                    alterDc={characterSpell.spell.data?.save_dc}
                  />
                  <SpellEffects value={characterSpell.spell.effects} />
                  <SpellComponents value={characterSpell.spell.components} />
                  <SpellDuration value={characterSpell.spell.duration} concentration={characterSpell.spell.concentration} />
                </div>

                <Show when={characterSpell.data}><p class="text-xs">{renderSpellData(characterSpell.data)}</p></Show>
                <Show when={characterSpell.notes}><p class="text-xs mt-2">{characterSpell.notes}</p></Show>
              </div>
            }
          </For>
        </div>
      </div>
      <Modal>
        <Show when={changingSpell()}>
          <p class="flex-1 text-xl text-left dark:text-snow mb-2">{changingSpell().name}</p>
          <TextArea
            rows="2"
            labelText={TRANSLATION[locale()]['spellNote']}
            onChange={(value) => setChangingSpell({ ...changingSpell(), notes: value })}
            value={changingSpell().notes}
          />
          <Button default textable classList="mt-2" onClick={updateSpell}>{TRANSLATION[locale()]['save']}</Button>
        </Show>
      </Modal>
    </>
  );
}
