import { Show, children } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

export const ContentNavButton = (props) => {
  const size = createWindowSize();
  const safeChildren = children(() => props.children);

  const className = () => [
    'content-nav-button',
    props.active ? 'active' : null,
  ].filter(Boolean).join(' ');

  return (
    <div
      class={className()}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      {safeChildren()}
      <Show when={size.width < 768}>
        <p class="content-nav-button-text">{props.text}</p>
      </Show>
    </div>
  );
}

