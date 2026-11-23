import { Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { DragDropProvider } from '@dnd-kit/solid';
import { useSortable } from '@dnd-kit/solid/sortable';

import { DragHandle } from '../../../assets';

export const LayoutNavButton = (props) => {
  const { ref, handleRef, isDragSource } = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
    get disabled() { return !props.draggable; }
  });

  return (
    <DragDropProvider>
      <div
        ref={ref}
        class="collection-item"
        classList={{
          'active': props.active,
          'dragging': isDragSource()
        }}
        onClick={props.onClick} // eslint-disable-line solid/reactivity
      >
        <Show when={props.draggable}>
          <button
            ref={handleRef}
            type="button"
            class="collection-item-drag"
            onClick={(event) => event.stopPropagation()}
          >
            <DragHandle />
          </button>
        </Show>
        <div class="collection-item-icon">
          <Show
            when={props.icon}
            fallback={
              <Show when={props.avatar} fallback={<span />}>
                <img src={props.avatar} />
              </Show>
            }
          >
            <Dynamic component={props.icon} />
          </Show>
        </div>
        <div class="character-item-box">
          <p class="collection-item-title">{props.title}</p>
          <p class="collection-item-description">{props.description}</p>
        </div>
      </div>
    </DragDropProvider>
  );
}
