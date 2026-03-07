import { CharKeeperAppContent } from './CharKeeperAppContent';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './context';

export const CharKeeperApp = (props) => (
  <AppStateProvider
    accessToken={props.accessToken}
    username={props.username}
    isAdmin={props.admin}
    colorSchema={props.colorSchema}
    providerLocales={props.providerLocales}
    identities={props.identities}
    oauthLinks={props.oauthLinks}
    oauthCredentials={props.oauthCredentials}
    host={props.host}
  >
    <AppLocaleProvider locale={props.locale}>
      <AppAlertProvider>
        <CharKeeperAppContent />
      </AppAlertProvider>
    </AppLocaleProvider>
  </AppStateProvider>
);
