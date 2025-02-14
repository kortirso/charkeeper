import { Show, splitProps } from 'solid-js';

import { CheckboxLabel } from './CheckboxLabel';

import { Close } from '../../assets';

export const Checkbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div
      class={[props.classList, 'flex items-center'].join(' ')}
      onClick={() => props.disabled ? null : props.onToggle()}
    >
      <Show when={props.labelPosition === 'left'}>
        <CheckboxLabel { ...labelProps } />
      </Show>
      <div
        class="toggle"
        classList={{ 'checked': props.checked }}
      >
        <Show when={props.checked}>
          <Close />
        </Show>
      </div>
      <Show when={props.labelPosition === 'right'}>
        <CheckboxLabel { ...labelProps } />
      </Show>
    </div>
  );
}
