import { Show } from 'solid-js';

import { Button } from '../../components';
import { Close, Edit, Check } from '../../assets';

const PADDING_MAP = { left: 'left-0', right: 'right-0' };

export const EditWrapper = (props) => {
  const className = props.position ? PADDING_MAP[props.position] : PADDING_MAP['left'];

  return (
    <div class="relative">
      {props.children}
      <Show when={!props.hidden}>
        <Show
          when={props.editMode}
          fallback={
            <Button
              default
              classList={`absolute bottom-0 ${className} rounded min-w-6 min-h-6 opacity-50`}
              onClick={() => props.onSetEditMode(true)}
            >
              <Edit />
            </Button>
          }
        >
          <div class={`absolute -bottom-6 ${className} flex justify-end z-10`}>
            <Button outlined classList="rounded min-w-6 min-h-6 mr-2" onClick={props.onCancelEditing}>
              <Close width="30" height="30" />
            </Button>
            <Button default classList="rounded min-w-6 min-h-6" onClick={props.onSaveChanges}>
              <Check width="20" height="20" />
            </Button>
          </div>
        </Show>
      </Show>
    </div>
  );
}
