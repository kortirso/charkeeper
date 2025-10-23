import { createSignal, For, Show, batch } from 'solid-js';

import { Button, Checkbox, createModal, TextArea } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { Minus, Plus } from '../../../../assets';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

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

  const renderDescription = (spellAbility) => {
    const bonus = props.character.proficiency_bonus + props.character.modifiers[spellAbility];
    return `${TRANSLATION[locale()]['attackBonus']} ${modifier(bonus)}, ${TRANSLATION[locale()]['saveDC']} ${8 + bonus}`;
  }

  const renderSpellData = (data) => {
    const result = [];
    if (data.limit) result.push(`${data.limit} ${TRANSLATION[locale()]['perDay']}`);
    if (data.level) result.push(`${TRANSLATION[locale()]['spellLevel']} ${data.level}`);
    if (data.attack_bonus) result.push(`${TRANSLATION[locale()]['attackBonus']} ${modifier(data.attack_bonus)}`);
    if (data.save_dc) result.push(`${TRANSLATION[locale()]['saveDC']} ${data.save_dc}`);

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
          <h2 class="text-lg dark:text-snow">
            <Show when={props.level !== '0'} fallback={TRANSLATION[locale()]['cantrips']}>
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
        <table class="w-full table first-column-full-width">
          <tbody>
            <For each={props.spells}>
              {(spell) =>
                <tr class="dark:text-snow">
                  <td class="py-1 pl-1">
                    <p
                      classList={{ 'cursor-pointer': !spell.data, 'opacity-50': !spell.ready_to_use }}
                      onClick={() => spell.data ? null : changeSpell(spell)}
                    >
                      {spell.name}
                    </p>
                    <Show when={spell.spell_ability}><p class="text-xs">{renderDescription(spell.spell_ability)}</p></Show>
                    <Show when={spell.data}><p class="text-xs">{renderSpellData(spell.data)}</p></Show>
                    <Show when={spell.notes}><p class="text-xs">{spell.notes}</p></Show>
                  </td>
                  <td>
                    <Show when={!spell.data && props.canPrepareSpells}>
                      <Show
                        when={spell.ready_to_use}
                        fallback={
                          <Button default size="small" onClick={() => props.onEnableSpell(spell.id)}>
                            <Plus width={20} height={20} />
                          </Button>
                        }
                      >
                        <Button default size="small" onClick={() => props.onDisableSpell(spell.id)}>
                          <Minus width={20} height={20} />
                        </Button>
                      </Show>
                    </Show>
                    <Show when={props.activeSpellClass === undefined}>
                      <p class="text-xs text-right">
                        {spell.prepared_by ? config.classes[spell.prepared_by]['name'][locale()] : TRANSLATION[locale()]['static']}
                      </p>
                    </Show>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
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
