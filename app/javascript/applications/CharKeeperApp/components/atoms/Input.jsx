import { Switch, Match, Show } from 'solid-js';

export const Input = (props) => (
  <div class={props.containerClassList}>
    <Show when={props.labelText}>
      <label class="text-sm/4 font-cascadia-light text-gray-400">{props.labelText}</label>
    </Show>
    <Switch
      fallback={
        <input
          type="text"
          class="w-full h-12 bordered px-2 font-cascadia-light"
          onInput={(e) => props.onInput(e.target.value)}
          value={props.value}
        />
      }
    >
      <Match when={props.numeric}>
        <input
          type="number"
          pattern="[0-9]*"
          inputmode="numeric"
          class="w-full h-12 bordered px-2 font-cascadia-light"
          onInput={(e) => props.onInput(e.target.value)}
          value={props.value}
        />
      </Match>
      <Match when={props.password}>
        <input
          type="password"
          class="w-full h-12 bordered px-2 font-cascadia-light"
          onInput={(e) => props.onInput(e.target.value)}
          value={props.value}
        />
      </Match>
    </Switch>
  </div>
);
