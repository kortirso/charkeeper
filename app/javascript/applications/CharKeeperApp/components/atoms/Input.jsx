import { Switch, Match, splitProps } from 'solid-js';

import { Label } from './Label';

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
            class="default-input"
            placeholder={props.placeholder || ''}
            onInput={(e) => props.onInput(e.target.value)}
            onKeyDown={handleKeyDown}
            value={props.value}
            dataTestId={props.dataTestId}
          />
        }
      >
        <Match when={props.numeric}>
          <input
            type="number"
            pattern="[0-9]*"
            inputmode="numeric"
            class="default-input"
            placeholder={props.placeholder || ''}
            onInput={(e) => props.onInput(e.target.value)}
            onKeyDown={handleKeyDown}
            value={props.value}
            dataTestId={props.dataTestId}
          />
        </Match>
        <Match when={props.password}>
          <input
            type="password"
            class="default-input"
            placeholder={props.placeholder || ''}
            onInput={(e) => props.onInput(e.target.value)}
            onKeyDown={handleKeyDown}
            value={props.value}
            dataTestId={props.dataTestId}
          />
        </Match>
      </Switch>
    </div>
  );
}
