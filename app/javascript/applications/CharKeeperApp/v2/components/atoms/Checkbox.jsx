import { createUniqueId, splitProps, Show } from 'solid-js';

export const Checkbox = (props) => {
  const [local, rest] = splitProps(props, [
    'checked', 'class', 'classList', 'controlClass', 'description', 'disabled', 'id', 'label', 'onChange', 'onToggle'
  ]);

  const generatedId = createUniqueId();
  const inputId = () => local.id || generatedId;
  const descriptionId = () => `${inputId()}-description`;

  const onChange = (event) => {
    local.onChange?.(event.currentTarget.checked, event);
    local.onToggle?.(event);
  };

  return (
    <label
      class={['checkbox', local.disabled ? 'checkbox-disabled' : '', local.class].filter(Boolean).join(' ')}
      classList={local.classList}
      for={inputId()}
    >
      <input
        {...rest}
        id={inputId()}
        class="checkbox-input"
        type="checkbox"
        checked={local.checked}
        disabled={local.disabled}
        aria-describedby={local.description ? descriptionId() : undefined}
        onChange={onChange}
      />
      <span class={['checkbox-control', local.controlClass].filter(Boolean).join(' ')} aria-hidden="true" />
      <span class="checkbox-content">
        <span class="checkbox-label">{local.label}</span>
        <Show when={local.description}>
          <span id={descriptionId()} class="checkbox-description">{local.description}</span>
        </Show>
      </span>
    </label>
  );
};
