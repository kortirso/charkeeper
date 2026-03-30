import { createEffect, createSignal, Show, children } from 'solid-js';

export const Toggle = (props) => {
  const isOpenByDefault = () => props.isOpen;
  const safeChildren = children(() => props.children);

  const [isOpen, setIsOpen] = createSignal(isOpenByDefault() === undefined ? false : isOpenByDefault());

  createEffect(() => setIsOpen(isOpenByDefault()));

  return (
    <div
      class={['mb-2 flex flex-col', props.containerClassList].join(' ')}
      classList={{ ...(props.classList || {}), 'blockable': !props.noInnerPadding }}
    >
      <div
        classList={{ 'blockable': props.noInnerPadding, 'cursor-pointer': !props.disabled }}
        class="toggle-title"
        onClick={() => props.disabled ? (props.onParentClick ? props.onParentClick() : null) : setIsOpen(!isOpen())}
      >
        {props.title}
      </div>
      <Show when={props.isOpenByParent !== undefined ? props.isOpenByParent : isOpen()}>
        <div
          class={['toggle-inner-default', props.innerClassList].join(' ')}
          classList={{ 'toggle-inner': !props.noInnerPadding, 'p-2': props.noInnerPadding }}
        >
          {safeChildren()}
        </div>
      </Show>
    </div>
  );
}
