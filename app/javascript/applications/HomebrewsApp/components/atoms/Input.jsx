import { Switch, Match, splitProps } from 'solid-js';

import { Label } from './Label';

const INPUT_STYLES = "w-full h-12 px-2 border border-gray-200 text-sm bg-white dark:bg-neutral-700 dark:border-gray-500 dark:text-snow rounded";

export const Input = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  const handleKeyDown = (event) => {
    if (!props.onKeyDown) return;
    if (event.key !== 'Enter') return;

    props.onKeyDown(event);
  }

  return (
    <div class={props.containerClassList}>
      <Label { ...labelProps } />
      <Switch
        fallback={
          <input
            type="text"
            class={INPUT_STYLES}
            placeholder={props.placeholder || ''}
            onInput={(e) => props.onInput(e.target.value)}
            onKeyDown={handleKeyDown}
            value={props.value}
          />
        }
      >
        <Match when={props.numeric}>
          <input
            type="number"
            pattern="[0-9]*"
            inputmode="numeric"
            class={INPUT_STYLES}
            placeholder={props.placeholder || ''}
            onInput={(e) => props.onInput(e.target.value)}
            onKeyDown={handleKeyDown}
            value={props.value}
          />
        </Match>
      </Switch>
    </div>
  );
}
