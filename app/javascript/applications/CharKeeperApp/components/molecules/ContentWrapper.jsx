import { createSignal, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

export const ContentWrapper = (props) => {
  const size = createWindowSize();

  const [activeView, setActiveView] = createSignal('left');

  return (
    <Switch>
      <Match when={size.width <= 1151}>
        {props.mobileView}
      </Match>
      <Match when={size.width >= 1152 && size.width <= 1407}>
        <div class="p-2 flex-1 overflow-y-scroll">
          <Switch>
            <Match when={activeView() === 'left'}>
              {props.leftView}
            </Match>
            <Match when={activeView() === 'right'}>
              {props.rightView}
            </Match>
          </Switch>
        </div>
      </Match>
      <Match when={size.width >= 1408}>
        <div class="flex-1 flex overflow-y-scroll">
          <div class="flex-1 p-2">
            {props.leftView}
          </div>
          <div class="flex-1 p-2">
            {props.rightView}
          </div>
        </div>
      </Match>
    </Switch>
  );
}
