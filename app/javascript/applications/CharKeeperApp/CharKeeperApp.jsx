import { Switch, Match } from 'solid-js';

import { CharKeeperAppContent } from './v1/CharKeeperAppContent';
import { Content } from './v2/Content';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './v1/context';
import { StateProvider, LocaleProvider } from './v2/context';

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
      <StateProvider
        accessToken={props.accessToken}
        username={props.username}
        isAdmin={props.admin}
        colorSchema={props.colorSchema}
        colorTheme={props.colorTheme}
        providerLocales={props.providerLocales}
        identities={props.identities}
        oauthLinks={props.oauthLinks}
        oauthCredentials={props.oauthCredentials}
        host={props.host}
      >
        <LocaleProvider locale={props.locale}>
          <Content />
        </LocaleProvider>
      </StateProvider>
    </Match>
  </Switch>
);
