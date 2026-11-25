import { createSignal, Switch, Match } from 'solid-js';

import { CharactersLayout, HomebrewsLayout, CampaignsLayout, SettingsLayout } from './layouts';
import { useAppState } from './context';

export const Content = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');

  const [appState] = useAppState();

  return (
    <div class="ck-v2" data-color-mode={appState.colorSchema} data-color-scheme={appState.colorTheme}>
      <Switch>
        <Match when={currentTab() === 'characters'}><CharactersLayout onChangeTab={setCurrentTab} /></Match>
        <Match when={currentTab() === 'homebrews'}><HomebrewsLayout onChangeTab={setCurrentTab} /></Match>
        <Match when={currentTab() === 'campaigns'}><CampaignsLayout onChangeTab={setCurrentTab} /></Match>
        <Match when={currentTab() === 'settings'}><SettingsLayout onChangeTab={setCurrentTab} /></Match>
      </Switch>
    </div>
  );
}
