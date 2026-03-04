import { Show } from 'solid-js';

export const Label = (props) => (
  <Show when={props.labelText}>
    <label
      class={[props.labelClassList, 'default-label'].join(' ')}
      classList={{ 'cursor-pointer': props.onClick }}
      onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
    >
      {props.labelText}
    </label>
  </Show>
);
