import { For, children } from 'solid-js';

export const StatsBlock = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div class="blockable mb-2">
      <div
        class='p-4 flex'
        classList={{ 'cursor-pointer': props.onClick }}
        onClick={props.onClick} // eslint-disable-line solid/reactivity
      >
        <For each={props.items}>
          {(item) =>
            <div class="flex-1 flex flex-col items-center">
              <p class="uppercase text-xs mb-1 dark:text-snow">{item.title}</p>
              <p class="text-2xl mb-1 dark:text-snow">{item.value}</p>
            </div>
          }
        </For>
      </div>
      {safeChildren()}
    </div>
  );
}
