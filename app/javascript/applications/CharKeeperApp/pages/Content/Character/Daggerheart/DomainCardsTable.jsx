import { For, Show, Switch, Match } from 'solid-js';

import { Button } from '../../../../components';
import { Close, Arrow } from '../../../../assets';

export const DomainCardsTable = (props) => {
  const spells = () => props.spells;

  return (
    <div class="blockable p-4 mb-2">
      <h2 class="text-lg dark:text-snow">{props.title}</h2>
      <Show when={spells().length > 0}>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td />
            </tr>
          </thead>
          <tbody>
            <For each={spells()}>
              {(spell) =>
                <tr>
                  <td class="py-1 pl-1">
                    <p class="cursor-pointer dark:text-snow" onClick={() => props.onChangeSpell(spell)}>{spell.name}</p>
                    <Show when={spell.notes}>
                      <p class="text-sm mt-1 dark:text-snow">{spell.notes}</p>
                    </Show>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <Switch>
                        <Match when={spell.ready_to_use}>
                          <Button default size="small" onClick={() => props.onUpdateCharacterSpell(spell, { character_spell: { ready_to_use: false } })}>
                            <Arrow bottom width={16} height={16} />
                          </Button>
                        </Match>
                        <Match when={!spell.ready_to_use}>
                          <Button default size="small" onClick={() => props.onUpdateCharacterSpell(spell, { character_spell: { ready_to_use: true } })}>
                            <Arrow top width={16} height={16} />
                          </Button>
                        </Match>
                      </Switch>
                      <Button default size="small" classList="ml-4" onClick={() => props.onRemoveCharacterSpell(spell)}>
                        <Close />
                      </Button>
                    </div>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}
