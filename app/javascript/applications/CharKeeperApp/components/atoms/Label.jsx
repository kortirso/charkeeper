import { Show } from 'solid-js';

export const Label = (props) => (
  <Show when={props.labelText}>
    <label
      class="text-sm/4 font-cascadia-light text-gray-400"
      classList={props.labelClassList}
      onClick={props.onClick ? props.onClick : null} // eslint-disable-line solid/reactivity
    >
      {props.labelText}
    </label>
  </Show>
);


