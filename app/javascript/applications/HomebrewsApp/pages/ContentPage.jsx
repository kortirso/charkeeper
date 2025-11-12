import { Switch, Match } from 'solid-js';

import { Dnd5, Dnd2024, Daggerheart, Pathfinder2, Dc20 } from '../pages';

import { useAppState } from '../context';

export const ContentPage = (props) => {
  const [appState] = useAppState();

  return (
    <div>
      <Switch fallback={<></>}>
        <Match when={appState.activePage === 'dnd5'}>
          <Dnd5 onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'dnd2024'}>
          <Dnd2024 onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'daggerheart'}>
          <Daggerheart onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'pathfinder2'}>
          <Pathfinder2 onNavigate={props.onNavigate} />
        </Match>
        <Match when={appState.activePage === 'dc20'}>
          <Dc20 onNavigate={props.onNavigate} />
        </Match>
      </Switch>
    </div>
  );
}
