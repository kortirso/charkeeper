import { Show, splitProps } from 'solid-js';

import { Label } from './Label';
import { Stroke } from '../../assets';

export const Checkbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')}>
      <Show when={props.labelPosition === 'left'}>
        <Label { ...labelProps } onClick={() => props.disabled ? null : props.onToggle()} />
      </Show>
      <div
        class={[props.innerClassList, 'toggle'].join(' ')}
        classList={{ 'checked': props.checked, 'outlined': props.outlined }}
        onClick={() => props.disabled ? null : props.onToggle()}
      >
        <Show when={props.checked && !props.filled}>
          <Stroke />
        </Show>
      </div>
      <Show when={props.labelPosition === 'right'}>
        <Label { ...labelProps } onClick={() => props.disabled ? null : props.onToggle()} />
      </Show>
    </div>
  );
}
