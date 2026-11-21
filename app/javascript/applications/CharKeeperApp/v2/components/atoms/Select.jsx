import { createMemo, createSignal, createUniqueId, onCleanup, onMount, splitProps, For, Show } from 'solid-js';

import { Label } from '../../components';

const normalizeOptions = (options) => {
  if (Array.isArray(options)) {
    return options.map((option) => {
      if (typeof option === 'object') return option;

      return { label: option, value: option };
    });
  }

  return Object.entries(options || {}).map(([value, label]) => ({ label, value }));
};

export const Select = (props) => {
  const [local, rest] = splitProps(props, [
    'class', 'classList', 'containerClass', 'containerClassList', 'disabled', 'dropdownClass',
    'emptyText', 'id', 'items', 'label', 'labelClass', 'name', 'onChange',
    'onSelect', 'optionClass', 'options', 'placeholder', 'selectedValue', 'value'
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);

  const generatedId = createUniqueId();
  const selectId = () => local.id || generatedId;
  const listboxId = () => `${selectId()}-listbox`;
  const selectedValue = () => local.value ?? local.selectedValue;
  const options = createMemo(() => normalizeOptions(local.options || local.items));
  const selectedOption = createMemo(() => options().find((option) => option.value === selectedValue()));

  let root;

  const firstEnabledIndex = () => options().findIndex((option) => !option.disabled);
  const lastEnabledIndex = () => {
    for (let index = options().length - 1; index >= 0; index -= 1) {
      if (!options()[index].disabled) return index;
    }

    return -1;
  };

  const open = () => {
    if (local.disabled) return;

    const selectedIndex = options().findIndex((option) => option.value === selectedValue() && !option.disabled);

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex());
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const toggle = () => isOpen() ? close() : open();

  const selectOption = (option) => {
    if (option.disabled) return;

    local.onChange?.(option.value, option);
    local.onSelect?.(option.value, option);
    close();
  };

  const moveActiveIndex = (direction) => {
    if (options().length === 0) return;

    let index = activeIndex();

    for (let step = 0; step < options().length; step += 1) {
      index = (index + direction + options().length) % options().length;
      if (!options()[index].disabled) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const onKeyDown = (event) => {
    if (local.disabled) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen()) open();
      else moveActiveIndex(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }

    if (event.key === 'Home' && isOpen()) {
      event.preventDefault();
      setActiveIndex(firstEnabledIndex());
      return;
    }

    if (event.key === 'End' && isOpen()) {
      event.preventDefault();
      setActiveIndex(lastEnabledIndex());
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen()) open();
      else if (activeIndex() >= 0) selectOption(options()[activeIndex()]);
      return;
    }

    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close();
    }

    if (event.key === 'Tab') close();
  };

  onMount(() => {
    const onPointerDown = (event) => {
      if (!root.contains(event.target)) close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    onCleanup(() => document.removeEventListener('pointerdown', onPointerDown));
  });

  return (
    <div
      ref={root}
      class={['field select', local.containerClass].filter(Boolean).join(' ')}
      classList={local.containerClassList}
    >
      <Show when={local.label}>
        <Label containerClass={local.labelClass} for={selectId()}>{local.label}</Label>
      </Show>
      <div class="select-control">
        <button
          {...rest}
          id={selectId()}
          class={['select-trigger', isOpen() ? 'select-trigger-open' : '', local.class].filter(Boolean).join(' ')}
          classList={local.classList}
          type="button"
          role="combobox"
          aria-controls={listboxId()}
          aria-expanded={isOpen()}
          aria-haspopup="listbox"
          aria-activedescendant={isOpen() && activeIndex() >= 0 ? `${selectId()}-option-${activeIndex()}` : undefined}
          disabled={local.disabled}
          onClick={toggle}
          onKeyDown={onKeyDown}
        >
          <span classList={{ 'select-placeholder': !selectedOption() }}>
            {selectedOption()?.label || local.placeholder || '—'}
          </span>
          <span class="select-chevron" aria-hidden="true" />
        </button>
        <Show when={local.name}>
          <input type="hidden" name={local.name} value={selectedValue() ?? ''} />
        </Show>
        <Show when={isOpen()}>
          <div
            id={listboxId()}
            class={['select-dropdown', local.dropdownClass].filter(Boolean).join(' ')}
            role="listbox"
            aria-label={local.label}
          >
            <Show when={options().length > 0} fallback={<p class="select-empty">{local.emptyText || '—'}</p>}>
              <For each={options()}>
                {(option, index) =>
                  <button
                    id={`${selectId()}-option-${index()}`}
                    class={[
                      'select-option',
                      option.value === selectedValue() ? 'select-option-selected' : '',
                      index() === activeIndex() ? 'select-option-active' : '',
                      local.optionClass
                    ].filter(Boolean).join(' ')}
                    type="button"
                    role="option"
                    aria-selected={option.value === selectedValue()}
                    disabled={option.disabled}
                    onClick={() => selectOption(option)}
                    onMouseEnter={() => setActiveIndex(index())}
                  >
                    <span>{option.label}</span>
                    <Show when={option.value === selectedValue()}>
                      <span class="select-option-check" aria-hidden="true">✓</span>
                    </Show>
                  </button>
                }
              </For>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
