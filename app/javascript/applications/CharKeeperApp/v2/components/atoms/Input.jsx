import { createUniqueId, splitProps, Show } from 'solid-js';

import { Label } from '../../components';

export const Input = (props) => {
  const [local, rest] = splitProps(props, [
    'class', 'classList', 'containerClass', 'containerClassList', 'id', 'label', 'labelClass', 'onInput', 'placeholder'
  ]);

  const inputId = () => local.id || createUniqueId();

  const onInput = (event) => local.onInput?.(event.currentTarget.value, event);

  return (
    <div
      class={['field', local.containerClass].filter(Boolean).join(' ')}
      classList={local.containerClassList}
    >
      <Show when={local.label}>
        <Label containerClass={local.labelClass} for={inputId()}>{local.label}</Label>
      </Show>
      <input
        {...rest}
        id={inputId()}
        class={['input', local.class].filter(Boolean).join(' ')}
        classList={local.classList}
        placeholder={local.placeholder || ''}
        onInput={onInput}
      />
    </div>
  );
};
