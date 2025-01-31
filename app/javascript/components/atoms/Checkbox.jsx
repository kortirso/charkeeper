import { Show, splitProps } from 'solid-js';

import { CheckboxLabel } from './CheckboxLabel';

export const Checkbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class="flex items-center" onClick={() => props.disabled ? null : props.onToggle()}>
      <Show when={props.labelPosition === 'left'}>
        <CheckboxLabel { ...labelProps } />
      </Show>
      <div class="toggle">
        <input
          checked={props.checked}
          disabled={props.disabled}
          class="toggle-checkbox"
          type="checkbox"
        />
        <label class="toggle-label" />
      </div>
      <Show when={props.labelPosition === 'right'}>
        <CheckboxLabel { ...labelProps } />
      </Show>
    </div>
  );
}
