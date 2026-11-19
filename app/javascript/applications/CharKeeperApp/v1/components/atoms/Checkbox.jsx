import { Show, splitProps } from 'solid-js';

import { Label } from './Label';
import { Stroke } from '../../assets';

export const Checkbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')} dataTestId={props.dataTestId}>
      <Show when={props.labelPosition === 'left'}>
        <Label { ...labelProps } onClick={(e) => props.disabled ? null : props.onToggle(e)} />
      </Show>
      <div
        class="toggle"
        classList={{ 'checked': props.checked, 'outlined': props.outlined, 'disabled': props.disabled, 'big': props.big }}
        onClick={(e) => props.disabled ? null : props.onToggle(e)}
      >
        <Show when={props.checked && !props.filled}>
          <Stroke />
        </Show>
        <Show when={!props.checked && !props.filled && !props.disabled}>
          <Stroke currentColor="#EEE" />
        </Show>
      </div>
      <Show when={props.labelPosition === 'right'}>
        <Label { ...labelProps } onClick={(e) => props.disabled ? null : props.onToggle(e)} />
      </Show>
    </div>
  );
}
