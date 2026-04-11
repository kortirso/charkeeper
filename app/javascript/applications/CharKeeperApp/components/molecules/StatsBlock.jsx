import { For, children } from 'solid-js';

export const StatsBlock = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div class="blockable mb-2">
      <div
        class="py-4 grid"
        classList={{
          'grid-cols-2 md:grid-cols-4 gap-2': props.items.length === 4,
          'grid-cols-3 gap-x-2': props.items.length === 3,
          'cursor-pointer': props.onClick
        }}
        onClick={props.onClick} // eslint-disable-line solid/reactivity
      >
        <For each={props.items}>
          {(item) =>
            <div class="flex-1 flex flex-col items-center">
              <p class="stat-title">{item.title}</p>
              <p class="text-2xl mb-1">{item.value}</p>
            </div>
          }
        </For>
      </div>
      {safeChildren()}
    </div>
  );
}
