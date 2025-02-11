import { Show } from 'solid-js';

export const CheckboxLabel = (props) => (
  <Show when={props.labelText}>
    <label
      class={[props.labelClassList, 'cursor-pointer'].join(' ')}
    >{props.labelText}</label>
  </Show>
);
