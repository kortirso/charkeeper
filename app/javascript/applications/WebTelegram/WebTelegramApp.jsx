import { WebTelegramAppContent } from './WebTelegramAppContent';

import { AppStateProvider, AppLocaleProvider, AppAlertProvider } from './context';

export const WebTelegramApp = () => (
  <AppStateProvider>
    <AppLocaleProvider>
      <AppAlertProvider>
        <WebTelegramAppContent />
      </AppAlertProvider>
    </AppLocaleProvider>
  </AppStateProvider>
);
