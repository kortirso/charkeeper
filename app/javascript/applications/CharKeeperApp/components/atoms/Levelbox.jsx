import { Show, splitProps } from 'solid-js';

import { Label } from './Label';

export const Levelbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')}>
      <Show when={props.labelPosition === 'left'}>
        <Label { ...labelProps } onClick={() => props.onToggle()} />
      </Show>
      <div class="toggle" onClick={() => props.onToggle()}>
        {props.value}
      </div>
      <Show when={props.labelPosition === 'right'}>
        <Label { ...labelProps } onClick={() => props.onToggle()} />
      </Show>
    </div>
  );
}
