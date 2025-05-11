import { children } from 'solid-js';

export const IconButton = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div
      class={[props.classList, 'w-6 h-6 flex justify-center items-center cursor-pointer'].join(' ')}
      classList={{ 'w-8 h-8': props.size === 'big' }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
    </div>
  );
}
