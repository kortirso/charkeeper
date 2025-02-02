import { Show } from 'solid-js';

export const Input = (props) => (
  <div class={props.classList}>
    <Show when={props.labelText}>
      <label class="text-sm">{props.labelText}</label>
    </Show>
    <input
      class="w-full bordered py-2.5 px-2 text-sm"
      onInput={(e) => props.onInput(e.target.value)}
      value={props.value}
    />
  </div>
);
