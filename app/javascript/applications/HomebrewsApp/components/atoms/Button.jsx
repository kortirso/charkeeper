import { children } from 'solid-js';

export const Button = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <p
      class={[props.classList, 'inline-block rounded cursor-pointer flex justify-center items-center'].join(' ')}
      classList={{
        'bg-gray-200 hover:bg-gray-300': props.default,
        'text-sm': props.small,
        'bg-neutral-800! text-snow': props.active
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </p>
  );
}
