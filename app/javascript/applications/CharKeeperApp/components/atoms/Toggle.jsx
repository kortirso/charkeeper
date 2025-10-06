import { createSignal, Show, children } from 'solid-js';

export const Toggle = (props) => {
  const isOpenByDefault = () => props.isOpen;
  const safeChildren = children(() => props.children);

  const [isOpen, setIsOpen] = createSignal(isOpenByDefault() === undefined ? false : isOpenByDefault());

  return (
    <div class="blockable mb-2 flex flex-col">
      <div
        class="py-2 px-4 cursor-pointer dark:text-snow"
        onClick={() => props.disabled ? (props.onParentClick ? props.onParentClick() : null) : setIsOpen(!isOpen())}
      >
        {props.title}
      </div>
      <Show when={props.isOpenByParent ? props.isOpenByParent : isOpen()}>
        <div class="flex-1 p-4 border-t border-gray-200 dark:border-gray-500 dark:text-snow relative">
          {safeChildren()}
        </div>
      </Show>
    </div>
  );
}
