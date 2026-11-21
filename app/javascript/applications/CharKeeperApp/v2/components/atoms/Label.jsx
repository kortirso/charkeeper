import { children } from 'solid-js';

export const Label = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <label class={['field-label', props.containerClass].filter(Boolean).join(' ')} for={props.for}>
      <span>{safeChildren()}</span>
    </label>
  );
};
