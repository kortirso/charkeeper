import { For, children } from 'solid-js';

export const StatsBlock = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div class="white-box mb-2">
      <div
        class={`p-4 flex ${props.onClick ? 'cursor-pointer' : ''}`}
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
      {safeChildren()}
    </div>
  );
}
