import { children, splitProps } from 'solid-js';

const VARIANT_CLASSES = {
  danger: 'button-danger',
  ghost: 'button-ghost',
  primary: 'button-primary',
  secondary: 'button-secondary'
};

const SIZE_CLASSES = {
  small: 'button-small',
  medium: 'button-medium',
  large: 'button-large'
};

export const Button = (props) => {
  const [local, rest] = splitProps(props, [
    'children', 'class', 'classList', 'disabled', 'size', 'variant'
  ]);

  const safeChildren = children(() => local.children);

  const className = () => [
    'button',
    VARIANT_CLASSES[local.variant || 'primary'],
    SIZE_CLASSES[local.size || 'medium'],
    local.class
  ].filter(Boolean).join(' ');

  return (
    <button {...rest} class={className()} classList={local.classList} disabled={local.disabled} type="button">
      <span>{safeChildren()}</span>
    </button>
  );
};
