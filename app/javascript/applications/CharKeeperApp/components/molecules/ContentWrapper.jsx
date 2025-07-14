import { createSignal, Switch, Match, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { Button } from '../../components';
import { Arrow } from '../../assets';

export const ContentWrapper = (props) => {
  const size = createWindowSize();

  const [activeView, setActiveView] = createSignal('left');

  return (
    <Switch>
      <Match when={props.mobileView && size.width <= 1151}>
        {props.mobileView}
      </Match>
      <Match when={size.width <= 1407}>
        <div class="p-2 pt-4 flex-1 overflow-y-scroll relative">
          <Switch>
            <Match when={props.activeView ? props.activeView === 'left' : activeView() === 'left'}>
              <Show when={!props.activeView}>
                <Button
                  default
                  classList='absolute z-10 top-0 right-0 rounded min-w-6 min-h-6 opacity-75'
                  onClick={() => setActiveView('right')}
                >
                  <Arrow forward />
                </Button>
              </Show>
              {props.leftView}
            </Match>
            <Match when={props.activeView ? props.activeView === 'right' : activeView() === 'right'}>
              <Show when={!props.activeView}>
                <Button
                  default
                  classList='absolute z-10 top-0 left-0 rounded min-w-6 min-h-6 opacity-75'
                  onClick={() => setActiveView('left')}
                >
                  <Arrow back />
                </Button>
              </Show>
              {props.rightView}
            </Match>
          </Switch>
        </div>
      </Match>
      <Match when={size.width >= 1408}>
        <div class="flex-1 flex overflow-y-scroll">
          <div class="w-1/2 p-2">
            {props.leftView}
          </div>
          <div class="w-1/2 p-2">
            {props.rightView}
          </div>
        </div>
      </Match>
    </Switch>
  );
}
