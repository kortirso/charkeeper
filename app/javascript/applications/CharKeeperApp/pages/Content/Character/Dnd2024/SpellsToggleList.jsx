import { createSignal, createMemo, For, Show, batch } from 'solid-js';

import { SpellCastTime, SpellRange, SpellAttack, SpellComponents, SpellDuration, SpellEffects } from '../../../../pages';
import { Button, Checkbox, createModal, TextArea, Toggle } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { Minus, Plus } from '../../../../assets';
import { useAppState, useAppLocale } from '../../../../context';
import { fetchSpellRequest } from '../../../../requests/fetchSpellRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    ritual: 'R',
    concentration: 'C',
    perDay: 'per day',
    spellLevel: 'as level',
    cantrips: 'Cantrips',
    level: 'level',
    spellNote: 'Spell note',
    static: 'Static',
    save: 'Save',
    damageUp: '<p>The damage increases by 1 dice when you reach levels 5, 11 and 17.</p>'
  },
  ru: {
    ritual: 'Р',
    concentration: 'К',
    perDay: 'раз в день',
    spellLevel: 'как на уровне',
    cantrips: 'Заговоры',
    level: 'уровень',
    spellNote: 'Заметка о заклинании',
    static: 'Врождённое',
    save: 'Сохранить',
    damageUp: '<p>Урон увеличивается на 1 кость, когда вы достигаете 5, 11 и 17 уровня.</p>'
  }
}

export const SpellsToggleList = (props) => {
  const [changingSpell, setChangingSpell] = createSignal(null);
  const [descriptions, setDescriptions] = createSignal({});
  const [openDescriptions, setOpenDescriptions] = createSignal({});

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const cantripsDamageDice = createMemo(() => {
    const level = props.character.level;
    const modifier = level >= 17 ? 4 : (level >= 11 ? 3 : (level >= 5 ? 2 : 1));
    return `${modifier}d`;
  });

  const renderSpellData = (data) => {
    const result = [];
    if (data.limit) result.push(`${data.limit} ${localize(TRANSLATION, locale())['perDay']}`);
    if (data.level) result.push(`${localize(TRANSLATION, locale())['spellLevel']} ${data.level}`);

    return result.join(', ');
  }

  const changeSpell = (event, spell) => {
    event.stopPropagation();
    batch(() => {
      setChangingSpell(spell);
      openModal();
    });
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

  const enableSpell = (event, characterSpellId) => {
    event.stopPropagation();
    props.onEnableSpell(characterSpellId);
  }

  const disableSpell = (event, characterSpellId) => {
    event.stopPropagation();
    props.onDisableSpell(characterSpellId);
  }

  const updateSpell = () => {
    props.onUpdateCharacterSpell(changingSpell().id, { notes: changingSpell().notes });
    closeModal();
  }

  return (
    <>
      <div class="mb-2 px-4 py-2">
        <div class="flex justify-between items-center">
          <h2 class="text-lg dark:text-snow">
            <Show when={props.level !== 0} fallback={localize(TRANSLATION, locale())['cantrips']}>
              {props.level} {localize(TRANSLATION, locale())['level']}
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
      </div>
      <For each={props.spells}>
        {(characterSpell) =>
          <Toggle
            disabled
            onParentClick={() => showInfo(characterSpell.spell)}
            isOpenByParent={openDescriptions()[characterSpell.spell.id]}
            containerClassList="mb-1!"
            title={
              <div class="dnd2024-spell">
                <div class="dnd2024-spell-header">
                  <div class="dnd2024-spell-titlebox">
                    <p class="dnd2024-spell-title" onClick={(event) => characterSpell.data ? null : changeSpell(event, characterSpell)}>
                      {characterSpell.spell.title}
                    </p>
                    <Show when={characterSpell.spell.ritual}><span>{localize(TRANSLATION, locale()).ritual}</span></Show>
                    <Show when={characterSpell.spell.concentration}><span class="ml-1">{localize(TRANSLATION, locale()).concentration}</span></Show>
                  </div>
                  <div>
                    <Show when={!characterSpell.data && props.canPrepareSpells}>
                      <Show
                        when={characterSpell.ready_to_use}
                        fallback={
                          <Button default size="small" onClick={(event) => enableSpell(event, characterSpell.id)}>
                            <Plus width={20} height={20} />
                          </Button>
                        }
                      >
                        <Button default size="small" onClick={(event) => disableSpell(event, characterSpell.id)}>
                          <Minus width={20} height={20} />
                        </Button>
                      </Show>
                    </Show>
                  </div>
                </div>
                <Show when={props.activeSpellClass === undefined}>
                  <p class="text-xs">
                    {characterSpell.prepared_by ? config.classes[characterSpell.prepared_by]['name'][locale()] : localize(TRANSLATION, locale())['static']}
                  </p>
                </Show>
                <div class="dnd2024-spell-tooltips">
                  <SpellCastTime value={characterSpell.spell.time} />
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
                  <SpellEffects
                    value={characterSpell.spell.effects}
                    cantripsDamageDice={characterSpell.spell.damage_up ? cantripsDamageDice() : null}
                  />
                  <SpellComponents value={characterSpell.spell.components} />
                  <SpellDuration value={characterSpell.spell.duration} />
                </div>

                <Show when={characterSpell.data}><p class="text-xs">{renderSpellData(characterSpell.data)}</p></Show>
                <Show when={characterSpell.notes}><p class="text-xs mt-2">{characterSpell.notes}</p></Show>
              </div>
            }
          >
            <p
              class="feat-markdown"
              innerHTML={descriptions()[characterSpell.spell.id]} // eslint-disable-line solid/no-innerhtml
            />
          </Toggle>
        }
      </For>
      <Modal>
        <Show when={changingSpell()}>
          <p class="flex-1 text-xl text-left dark:text-snow mb-2">{changingSpell().name}</p>
          <TextArea
            rows="2"
            labelText={localize(TRANSLATION, locale()).spellNote}
            onChange={(value) => setChangingSpell({ ...changingSpell(), notes: value })}
            value={changingSpell().notes}
          />
          <Button default textable classList="mt-2" onClick={updateSpell}>{localize(TRANSLATION, locale()).save}</Button>
        </Show>
      </Modal>
    </>
  );
}
