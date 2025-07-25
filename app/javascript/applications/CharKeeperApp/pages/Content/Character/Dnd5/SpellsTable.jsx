import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button, Checkbox } from '../../../../components';
import { Minus, Plus } from '../../../../assets';
import { useAppLocale } from '../../../../context';

export const SpellsTable = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div class="blockable mb-2 p-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg dark:text-snow">
          <Show when={props.level !== '0'} fallback={t('terms.cantrips')}>
            {props.level} {t('spellbookPage.level')}
          </Show>
        </h2>
        <Show when={props.spentSpellSlots}>
          <div class="flex">
            <For each={[...Array((props.spentSpellSlots[props.level] || 0)).keys()]}>
              {() =>
                <Checkbox
                  filled
                  checked
                  classList="mr-1"
                  onToggle={() => props.onFreeSpellSlot(props.level)}
                />
              }
            </For>
            <For each={[...Array(props.slotsAmount - (props.spentSpellSlots[props.level] || 0)).keys()]}>
              {() =>
                <Checkbox
                  filled
                  classList="mr-1"
                  onToggle={() => props.onSpendSpellSlot(props.level)}
                />
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
                    class={`cursor-pointer ${spell.ready_to_use ? '' : 'opacity-50'}`}
                    // onClick={() => props.changeSpell(spell)}
                  >
                    {spell.name}
                  </p>
                  <Show when={spell.notes !== null}>
                    <p class="text-xs">{spell.notes}</p>
                  </Show>
                </td>
                <td>
                  <Show when={props.canPrepareSpells}>
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
                </td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  );
}
