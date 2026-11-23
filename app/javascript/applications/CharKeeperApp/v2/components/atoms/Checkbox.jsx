import { createUniqueId, splitProps } from 'solid-js';

export const Checkbox = (props) => {
  const [local, rest] = splitProps(props, [
    'checked', 'class', 'classList', 'controlClass', 'disabled', 'id', 'label', 'onChange', 'onToggle'
  ]);

  const inputId = () => local.id || createUniqueId();

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
        onChange={onChange}
      />
      <span class={['checkbox-control', local.controlClass].filter(Boolean).join(' ')} aria-hidden="true" />
      <span class="checkbox-content">
        <span class="checkbox-label">{local.label}</span>
      </span>
    </label>
  );
};
