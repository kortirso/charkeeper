import { Show, splitProps } from 'solid-js';

import { CheckboxLabel } from './CheckboxLabel';

export const Levelbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')}>
      <Show when={props.labelPosition === 'left'}>
        <CheckboxLabel { ...labelProps } onClick={() => props.onToggle()} />
      </Show>
      <div class="toggle" onClick={() => props.onToggle()}>
        {props.value}
      </div>
      <Show when={props.labelPosition === 'right'}>
        <CheckboxLabel { ...labelProps } onClick={() => props.onToggle()} />
      </Show>
    </div>
  );
}
