import { For } from 'solid-js';

export const StatsBlock = (props) => {
  return (
    <div
      class={`mb-2 p-4 flex white-box ${props.onClick ? 'cursor-pointer' : ''}`}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <For each={props.items}>
        {(item) =>
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-xs mb-1">{item.title}</p>
            <p class="text-2xl mb-1">{item.value}</p>
          </div>
        }
      </For>
    </div>
  );
}
