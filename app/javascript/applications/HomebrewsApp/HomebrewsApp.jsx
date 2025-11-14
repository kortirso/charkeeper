import { HomebrewsAppContent } from './HomebrewsAppContent';

import { AppStateProvider, AppLocaleProvider } from './context';

export const HomebrewsApp = (props) => (
  <AppStateProvider accessToken={props.accessToken}>
    <AppLocaleProvider locale={props.locale}>
      <HomebrewsAppContent />
    </AppLocaleProvider>
  </AppStateProvider>
);
