import { Show } from 'solid-js';

export const CheckboxLabel = (props) => (
  <Show when={props.labelText}>
    <label
      class={[props.labelClassList, 'cursor-pointer'].join(' ')}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >{props.labelText}</label>
  </Show>
);
