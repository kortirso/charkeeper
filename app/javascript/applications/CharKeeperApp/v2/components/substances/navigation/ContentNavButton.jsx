import { Show, children } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

export const ContentNavButton = (props) => {
  const size = createWindowSize();
  const safeChildren = children(() => props.children);

  return (
    <div
      class='content-nav-button'
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
      <Show when={size.width < 768}>
        <p class='content-nav-button-text'>{props.text}</p>
      </Show>
    </div>
  );
}

