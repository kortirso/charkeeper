import { Switch, Match, splitProps } from 'solid-js';

import { Label } from './Label';

export const Input = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={props.containerClassList}>
      <Label { ...labelProps } />
      <Switch
        fallback={
          <input
            type="text"
            class="w-full h-12 px-2 border border-gray-200 text-sm bg-white dark:bg-neutral-700 dark:border-gray-500 dark:text-snow rounded"
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
            class="w-full h-12 px-2 border border-gray-200 text-sm bg-white dark:bg-neutral-700 dark:border-gray-500 dark:text-snow rounded"
            onInput={(e) => props.onInput(e.target.value)}
            value={props.value}
          />
        </Match>
        <Match when={props.password}>
          <input
            type="password"
            class="w-full h-12 px-2 border border-gray-200 text-sm bg-white dark:bg-neutral-700 dark:border-gray-500 dark:text-snow rounded"
            onInput={(e) => props.onInput(e.target.value)}
            value={props.value}
          />
        </Match>
      </Switch>
    </div>
  );
}
