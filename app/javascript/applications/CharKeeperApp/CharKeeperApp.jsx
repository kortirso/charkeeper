import { Switch, Match } from 'solid-js';

import { CharKeeperAppContent } from './v1/CharKeeperAppContent';
import { Content } from './v2/Content';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './v1/context';
import { LocaleProvider } from './v2/context';

export const CharKeeperApp = (props) => (
  <Switch
    fallback={
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
    }
  >
    <Match when={props.version === 'v2'}>
      <LocaleProvider locale={props.locale}>
        <Content colorMode={props.colorSchema} />
      </LocaleProvider>
    </Match>
  </Switch>
);
