import { Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { DragHandle, Avatar } from '../../../assets';

export const LayoutNavButton = (props) => {
  return (
    <div
      ref={props.sortableRef}
      class="collection-item"
      classList={{
        'active': props.active,
        'dragging': props.isDragging
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <Show when={props.draggable}>
        <button
          ref={props.dragHandleRef}
          type="button"
          class="collection-item-drag"
          onClick={(event) => event.stopPropagation()}
        >
          <DragHandle />
        </button>
      </Show>
      <Show
        when={props.icon}
        fallback={
          <Show when={props.avatar} fallback={<Avatar width={64} height={64} />}>
            <img src={props.avatar} class="collection-item-avatar" />
          </Show>
        }
      >
        <div class="collection-item-icon">
          <Dynamic component={props.icon} />
        </div>
      </Show>
      <div class="character-item-box">
        <p class="collection-item-title">{props.title}</p>
        <Show when={props.description}><p class="collection-item-description">{props.description}</p></Show>
        <Show when={props.additional}><p class="collection-item-description">{props.additional}</p></Show>
      </div>
    </div>
  );
}
