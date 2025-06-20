import { Show } from 'solid-js';

export const Input = (props) => (
  <div class={props.containerClassList}>
    <Show when={props.labelText}>
      <label class="text-sm/4 font-cascadia-light text-gray-400">{props.labelText}</label>
    </Show>
    <Show
      when={props.numeric}
      fallback={
        <input
          class="w-full h-12 bordered px-2 font-cascadia-light"
          onInput={(e) => props.onInput(e.target.value)}
          value={props.value}
        />
      }
    >
      <input
        type="number"
        pattern="[0-9]*"
        inputmode="numeric"
        class="w-full h-12 bordered px-2 text-center"
        onInput={(e) => props.onInput(e.target.value)}
        value={props.value}
      />
    </Show>
  </div>
);
