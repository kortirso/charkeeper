import { Show } from 'solid-js';

export const Input = (props) => (
  <div class={props.classList}>
    <Show when={props.labelText}>
      <label class="text-sm">{props.labelText}</label>
    </Show>
    <Show
      when={props.numeric}
      fallback={
        <input
          class="w-full bordered py-2.5 px-2 text-sm"
          onInput={(e) => props.onInput(e.target.value)}
          value={props.value}
        />
      }
    >
      <input
        type="number"
        pattern="[0-9]*"
        inputmode="numeric"
        class="w-full bordered py-2.5 px-2 text-sm text-center"
        onInput={(e) => props.onInput(e.target.value)}
        value={props.value}
      />
    </Show>
  </div>
);
