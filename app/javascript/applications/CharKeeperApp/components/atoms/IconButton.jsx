import { children } from 'solid-js';

export const IconButton = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div
      class={[
        props.classList,
        'flex justify-center items-center cursor-pointer rounded-full hover:bg-gray-100 dark:hover:bg-gray-400'
      ].join(' ')}
      classList={{
        'w-6 h-6': props.size === undefined,
        'w-10 h-10': props.size === 'xl',
        'text-blue-600 hover:bg-white dark:text-fuzzy-red dark:hover:bg-dusty': props.colored && props.active,
        'text-gray-400 hover:bg-white dark:text-gray-200 dark:hover:bg-dusty': props.colored && !props.active
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </div>
  );
}
