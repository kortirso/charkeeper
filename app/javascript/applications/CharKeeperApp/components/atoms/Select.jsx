import { createSignal, createMemo, Show, For, Switch, Match, splitProps } from 'solid-js';

import { Label } from './Label';
import { useAppLocale } from '../../context';
import { Chevron } from '../../assets';
import { clickOutside, localize } from '../../helpers';

const TRANSLATION = {
  en: {
    clear: 'Cancel selection'
  },
  ru: {
    clear: 'Отменить выбор'
  }
}

export const Select = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  const [isOpen, setIsOpen] = createSignal(false);

  const [locale] = useAppLocale();

  const itemsForSelect = createMemo(() => {
    if (!props.withNull) return Object.entries(props.items);

    return [['null', localize(TRANSLATION, locale())['clear']]].concat(Object.entries(props.items));
  });

  const onSelect = (value) => {
    const newValue = value === 'null' ? null : value;
    props.onSelect(newValue);
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
          onClick={() => props.disabled ? null : setIsOpen(!isOpen())}
        >
          <Switch fallback={<span />}>
            <Match when={props.selectedValue}>
              <span class="truncate">{props.items[props.selectedValue]}</span>
            </Match>
            <Match when={props.selectedValues}>
              <span class="truncate">{Object.entries(props.items).filter(([key,]) => props.selectedValues.includes(key)).map(([,value]) => value).join(', ')}</span>
            </Match>
          </Switch>
          <Chevron rotated={isOpen()} />
        </div>
        <Show when={isOpen()}>
          <ul class="form-dropdown" classList={{ 'full': props.showAll }}>
            <For each={itemsForSelect()}>
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
