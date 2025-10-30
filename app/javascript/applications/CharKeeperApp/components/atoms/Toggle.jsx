import { createSignal, Show, children } from 'solid-js';

export const Toggle = (props) => {
  const isOpenByDefault = () => props.isOpen;
  const safeChildren = children(() => props.children);

  const [isOpen, setIsOpen] = createSignal(isOpenByDefault() === undefined ? false : isOpenByDefault());

  return (
    <div
      classList={{
        'blockable': !props.noInnerPadding,
        '': props.noInnerPadding
      }}
      class="mb-2 flex flex-col"
    >
      <div
        classList={{
          '': !props.noInnerPadding,
          'blockable': props.noInnerPadding,
          'cursor-pointer': !props.disabled
        }}
        class="py-2 px-4 dark:text-snow"
        onClick={() => props.disabled ? (props.onParentClick ? props.onParentClick() : null) : setIsOpen(!isOpen())}
      >
        {props.title}
      </div>
      <Show when={props.isOpenByParent ? props.isOpenByParent : isOpen()}>
        <div
          classList={{
            'p-4 border-t border-gray-200 dark:border-gray-500': !props.noInnerPadding,
            'p-2': props.noInnerPadding
          }}
          class="flex-1 dark:text-snow relative"
        >
          {safeChildren()}
        </div>
      </Show>
    </div>
  );
}
