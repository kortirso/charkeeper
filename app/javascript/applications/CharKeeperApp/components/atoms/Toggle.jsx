import { createSignal, Show, children } from 'solid-js';

export const Toggle = (props) => {
  const isOpenByDefault = () => props.isOpen;
  const safeChildren = children(() => props.children);

  const [isOpen, setIsOpen] = createSignal(isOpenByDefault() === undefined ? false : isOpenByDefault());

  return (
    <div class="blockable mb-2">
      <div class="py-2 px-4 cursor-pointer dark:text-snow" onClick={() => props.disabled ? null : setIsOpen(!isOpen())}>
        {props.title}
      </div>
      <Show when={isOpen()}>
        <div class="p-4 border-t border-gray-200 dark:border-gray-500 dark:text-snow">
          {safeChildren()}
        </div>
      </Show>
    </div>
  );
}
