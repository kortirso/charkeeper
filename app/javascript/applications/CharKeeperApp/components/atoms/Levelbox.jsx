import { Show, splitProps } from 'solid-js';

import { Label } from './Label';
import { LevelChevron } from '../../assets';

export const Levelbox = (props) => {
  const [labelProps] = splitProps(props, ['labelText', 'labelClassList']);

  return (
    <div class={[props.classList, 'flex items-center'].join(' ')}>
      <Show when={props.labelPosition === 'left'}>
        <Label { ...labelProps } onClick={() => props.onToggle ? props.onToggle() : null} />
      </Show>
      <Show
        when={props.number}
        fallback={
          <div
            class="levelbox"
            classList={{ 'cursor-pointer': props.onToggle }} onClick={() => props.onToggle ? props.onToggle() : null}
          >
            <LevelChevron size={props.value} />
          </div>
        }
      >
        <div class="toggle" onClick={() => props.onToggle()}>
          {props.value}
        </div>
      </Show>
      <Show when={props.labelPosition === 'right'}>
        <Label { ...labelProps } onClick={() => props.onToggle ? props.onToggle() : null} />
      </Show>
    </div>
  );
}
