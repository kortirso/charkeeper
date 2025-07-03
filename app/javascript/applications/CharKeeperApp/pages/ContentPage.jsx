import { Switch, Match } from 'solid-js';

import { CharacterTab, LocaleTab, FeedbackTab, UsernameTab, NotificationsTab } from '../pages';

import { useAppState } from '../context';

export const ContentPage = (props) => {
  const [appState] = useAppState();

  return (
    <div class="flex flex-col flex-1 w-full">
      <Switch fallback={<></>}>
        <Match when={appState.activePage === 'character'}>
          <CharacterTab onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'locale'}>
          <LocaleTab onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'notifications'}>
          <NotificationsTab onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'feedback'}>
          <FeedbackTab onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'profile'}>
          <UsernameTab onNavigate={props.onNavigate} />
        </Match>
      </Switch>
    </div>
  );
}
