import { Switch, Match } from 'solid-js';

import { Daggerheart } from '../pages';

import { useAppState } from '../context';

export const ContentPage = (props) => {
  const [appState] = useAppState();

  return (
    <div>
      <Switch fallback={<></>}>
        <Match when={appState.activePage === 'daggerheart'}>
          <Daggerheart onNavigate={props.onNavigate} />
        </Match>
      </Switch>
    </div>
  );
}
