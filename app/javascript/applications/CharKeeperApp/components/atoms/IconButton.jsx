import { children } from 'solid-js';

export const IconButton = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div
      class={[props.classList, 'flex justify-center items-center cursor-pointer rounded-full hover:bg-gray-100'].join(' ')}
      classList={{
        'w-6 h-6': props.size === undefined,
        'w-10 h-10': props.size === 'xl',
        'text-gray-400': props.inactive
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </div>
  );
}
