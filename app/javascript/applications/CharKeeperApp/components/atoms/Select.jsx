import { createSignal, Show, For, Switch, Match, splitProps } from 'solid-js';

import { Label } from './Label';
import { Chevron } from '../../assets';
import { clickOutside } from '../../helpers';

export const Select = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  const [isOpen, setIsOpen] = createSignal(false);

  const onSelect = (value) => {
    props.onSelect(value);
    if (!props.multi) setIsOpen(false);
  }

  return (
    <div
      class={[props.containerClassList, 'form-field'].join(' ')}
      use:clickOutside={() => setIsOpen(false)}
    >
      <Label { ...labelProps } />
      <div class={[props.classList, 'relative cursor-pointer'].join(' ')}>
        <div
          class={[isOpen() ? 'is-open' : '', 'form-value flex justify-between items-center h-12'].join(' ')}
          onClick={() => setIsOpen(!isOpen())}
        >
          <Switch fallback={''}>
            <Match when={props.selectedValue}>
              <span>{props.items[props.selectedValue]}</span>
            </Match>
            <Match when={props.selectedValues}>
              <span>{Object.entries(props.items).filter(([key,]) => props.selectedValues.includes(key)).map(([,value]) => value).join(', ')}</span>
            </Match>
          </Switch>
          <Chevron rotated={isOpen()} />
        </div>
        <Show when={isOpen()}>
          <ul class="form-dropdown">
            <For each={Object.entries(props.items)}>
              {([key, value]) =>
                <li
                  classList={{ 'selected': props.multi && props.selectedValues.includes(key) }}
                  onClick={() => onSelect(key)}
                >
                  {value}
                </li>
              }
            </For>
          </ul>
        </Show>
      </div>
    </div>
  );
}
