import { Show, For } from 'solid-js';

import { DndBonus } from '../../../components';

export const DndBonuses = (props) => {
  return (
    <Show when={props.bonuses.length > 0}>
      <div class="flex flex-wrap gap-1">
        <For each={props.bonuses}>
          {(bonus) =>
            <DndBonus bonus={bonus} />
          }
        </For>
      </div>
    </Show>
  );
}
