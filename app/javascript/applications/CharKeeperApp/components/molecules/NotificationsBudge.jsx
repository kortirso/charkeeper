import { Show } from 'solid-js';

import { useAppState } from '../../context';

export const NotificationsBudge = (props) => {
  const [appState] = useAppState();

  return (
    <Show when={appState.unreadNotificationsCount !== undefined && appState.unreadNotificationsCount > 0}>
      <div class={[props.positionStyle, 'absolute p-0.5 bg-white rounded-full'].join(' ')}>
        <p class="rounded-full bg-blue-400 text-white text-xs leading-3 w-4 h-4 flex items-center justify-center">
          {appState.unreadNotificationsCount}
        </p>
      </div>
    </Show>
  );
}
