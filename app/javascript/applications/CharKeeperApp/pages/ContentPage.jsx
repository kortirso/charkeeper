import { Switch, Match } from 'solid-js';

import {
  CharacterTab, PasswordsTab, FeedbackTab, UsernameTab, NotificationsTab, HomebrewContentTab, CharacterView
} from '../pages';

import { useAppState } from '../context';

export const ContentPage = (props) => {
  const [appState] = useAppState();

  return (
    <div class="flex flex-col w-full md:w-[calc(100%-24rem)] bg-neutral-100 dark:bg-neutral-900">
      <Switch fallback={<></>}>
        <Match when={appState.activePage === 'character'}>
          <CharacterTab onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'characterView'}>
          <CharacterView onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'passwords'}>
          <PasswordsTab onNavigate={props.onNavigate} />
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
        <Match when={appState.activePage === 'homebrew'}>
          <HomebrewContentTab onNavigate={props.onNavigate} />
        </Match>
      </Switch>
    </div>
  );
}
