import { children } from 'solid-js';

export const IconButton = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div
      class={[props.classList, 'default-icon-button'].join(' ')}
      classList={{
        'w-6 h-6': props.size === undefined,
        'w-10 h-10': props.size === 'xl',
        'text-blue-600 dark:text-fuzzy-red': props.colored && props.active,
        'text-gray-400 dark:text-gray-200': props.colored && !props.active,
        'hover:bg-white dark:hover:bg-dusty': props.colored
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </div>
  );
}

