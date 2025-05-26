import { Show, splitProps } from 'solid-js';

import { CheckboxLabel } from './CheckboxLabel';

import { Close } from '../../assets';

export const Checkbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')}>
      <Show when={props.labelPosition === 'left'}>
        <CheckboxLabel { ...labelProps } onClick={() => props.disabled ? null : props.onToggle()} />
      </Show>
      <div
        class="toggle"
        classList={{ 'checked': props.checked, 'border-dashed': props.outlined, 'bg-blue-400': props.checked && props.filled }}
        onClick={() => props.disabled ? null : props.onToggle()}
      >
        <Show when={props.checked && !props.filled}>
          <Close />
        </Show>
      </div>
      <Show when={props.labelPosition === 'right'}>
        <CheckboxLabel { ...labelProps } onClick={() => props.disabled ? null : props.onToggle()} />
      </Show>
    </div>
  );
}
