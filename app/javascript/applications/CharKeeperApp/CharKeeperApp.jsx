import { CharKeeperAppContent } from './CharKeeperAppContent';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider, AppI18nProvider } from './context';

export const CharKeeperApp = (props) => (
  <AppStateProvider
    accessToken={props.accessToken}
    username={props.username}
    isAdmin={props.admin}
    colorSchema={props.colorSchema}
  >
    <AppLocaleProvider locale={props.locale}>
      <AppI18nProvider locale={props.locale}>
        <AppAlertProvider>
          <CharKeeperAppContent />
        </AppAlertProvider>
      </AppI18nProvider>
    </AppLocaleProvider>
  </AppStateProvider>
);
