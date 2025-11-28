import { Show, For } from 'solid-js';

import { Bonus } from '../../components';

export const Bonuses = (props) => {
  return (
    <Show when={props.bonuses.length > 0}>
      <div class="flex flex-wrap gap-1">
        <For each={props.bonuses}>
          {(bonus) =>
            <Bonus bonus={bonus} />
          }
        </For>
      </div>
    </Show>
  );
}
