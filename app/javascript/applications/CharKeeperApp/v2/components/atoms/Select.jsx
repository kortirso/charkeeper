import { createMemo, createSignal, createUniqueId, onCleanup, onMount, splitProps, For, Show } from 'solid-js';

import { Label } from '../../components';

const normalizeOptions = (options) => {
  return Object.entries(options || {}).map(([value, label]) => ({ label, value }));
};

export const Select = (props) => {
  const [local, rest] = splitProps(props, [
    'class', 'classList', 'containerClass', 'containerClassList', 'disabled', 'dropdownClass', 'emptyText', 'id',
    'label', 'labelClass', 'name', 'onChange', 'onSelect', 'optionClass', 'options', 'placeholder', 'searchable',
    'searchPlaceholder', 'selectedValue', 'value'
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);
  const [search, setSearch] = createSignal('');

  const generatedId = createUniqueId();
  const selectId = () => local.id || generatedId;
  const listboxId = () => `${selectId()}-listbox`;
  const selectedValue = () => local.value ?? local.selectedValue;
  const options = createMemo(() => normalizeOptions(local.options));

  const filteredOptions = createMemo(() => {
    const query = search().trim().toLocaleLowerCase();
    if (!query) return options();

    return options().filter((option) => String(option.label).toLocaleLowerCase().includes(query));
  });

  const selectedOption = createMemo(() => options().find((option) => option.value === selectedValue()));

  let root;
  let searchInput;
  let trigger;

  const firstEnabledIndex = () => filteredOptions().findIndex((option) => !option.disabled);
  const lastEnabledIndex = () => {
    for (let index = filteredOptions().length - 1; index >= 0; index -= 1) {
      if (!filteredOptions()[index].disabled) return index;
    }

    return -1;
  };

  const open = () => {
    if (local.disabled) return;

    setSearch('');

    const selectedIndex = filteredOptions().findIndex((option) => option.value === selectedValue() && !option.disabled);

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : firstEnabledIndex());
    setIsOpen(true);

    if (local.searchable) queueMicrotask(() => searchInput?.focus());
  };

  const close = (restoreFocus = false) => {
    setIsOpen(false);
    setSearch('');
    if (restoreFocus) queueMicrotask(() => trigger?.focus());
  };

  const toggle = () => isOpen() ? close() : open();

  const selectOption = (option) => {
    if (option.disabled) return;

    local.onChange?.(option.value, option);
    local.onSelect?.(option.value, option);
    close(true);
  };

  const moveActiveIndex = (direction) => {
    if (filteredOptions().length === 0) return;

    let index = activeIndex();

    for (let step = 0; step < filteredOptions().length; step += 1) {
      index = (index + direction + filteredOptions().length) % filteredOptions().length;
      if (!filteredOptions()[index].disabled) {
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

    if (event.key === 'Enter' || (event.key === ' ' && !(local.searchable && isOpen()))) {
      event.preventDefault();
      if (!isOpen()) open();
      else if (activeIndex() >= 0) selectOption(filteredOptions()[activeIndex()]);
      return;
    }

    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close(true);
    }

    if (event.key === 'Tab') close();
  };

  const onSearchInput = (event) => {
    setSearch(event.currentTarget.value);
    setActiveIndex(firstEnabledIndex());
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
        <Show
          when={local.searchable && isOpen()}
          fallback={
            <button
              {...rest}
              ref={trigger}
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
          }
        >
          <div
            class={['select-trigger', 'select-trigger-open', 'select-search-trigger', local.class].filter(Boolean).join(' ')}
            classList={local.classList}
          >
            <input
              {...rest}
              ref={searchInput}
              id={selectId()}
              class="select-search-input"
              type="text"
              role="combobox"
              autocomplete="off"
              aria-autocomplete="list"
              aria-controls={listboxId()}
              aria-expanded="true"
              aria-haspopup="listbox"
              aria-activedescendant={activeIndex() >= 0 ? `${selectId()}-option-${activeIndex()}` : undefined}
              placeholder={local.searchPlaceholder || selectedOption()?.label || local.placeholder || 'Search…'}
              value={search()}
              onInput={onSearchInput}
              onKeyDown={onKeyDown}
            />
            <span class="select-chevron" aria-hidden="true" />
          </div>
        </Show>
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
            <Show when={filteredOptions().length > 0} fallback={<p class="select-empty">{local.emptyText || '—'}</p>}>
              <For each={filteredOptions()}>
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
