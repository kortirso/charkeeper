import { CharKeeperAppContent } from './CharKeeperAppContent';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './context';

export const CharKeeperApp = (props) => (
  <AppStateProvider accessToken={props.accessToken} username={props.username}>
    <AppLocaleProvider locale={props.locale}>
      <AppAlertProvider>
        <CharKeeperAppContent />
      </AppAlertProvider>
    </AppLocaleProvider>
  </AppStateProvider>
);
