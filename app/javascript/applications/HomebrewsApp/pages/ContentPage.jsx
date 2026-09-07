import { Switch, Match } from 'solid-js';

import { Daggerheart, Dnd2024, Nimble, Pathfinder2, Cosmere } from '../pages';

import { useAppState } from '../context';

export const ContentPage = (props) => {
  const [appState] = useAppState();

  return (
    <div>
      <Switch fallback={<></>}>
        <Match when={appState.activePage === 'daggerheart'}>
          <Daggerheart onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'dnd2024'}>
          <Dnd2024 onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'nimble'}>
          <Nimble onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'pathfinder2'}>
          <Pathfinder2 onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'cosmere'}>
          <Cosmere onNavigate={props.onNavigate} />
        </Match>
      </Switch>
    </div>
  );
}
