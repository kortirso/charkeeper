import { children } from 'solid-js';

export const Button = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <p
      class={[props.classList, 'rounded cursor-pointer flex justify-center items-center font-cascadia'].join(' ')}
      classList={{
        'min-h-10 min-w-10': props.size === undefined || props.size === 'default',
        'min-h-6 min-w-6 text-sm': props.size === 'small',
        'bg-blue-400 text-snow dark:bg-red': props.default,
        'bg-white text-blue-400 border border-blue-400 dark:text-black dark:border-red': props.outlined,
        'px-2 py-1': props.textable
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </p>
  );
}
