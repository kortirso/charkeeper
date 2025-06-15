import { WebTelegramAppContent } from './WebTelegramAppContent';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './context';

export const WebTelegramApp = (props) => (
  <AppStateProvider accessToken={props.accessToken}>
    <AppLocaleProvider locale={props.locale}>
      <AppAlertProvider>
        <WebTelegramAppContent />
      </AppAlertProvider>
    </AppLocaleProvider>
  </AppStateProvider>
);
