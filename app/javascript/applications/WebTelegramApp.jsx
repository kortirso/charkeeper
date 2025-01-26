import { WebTelegramAppContent } from './WebTelegramAppContent';

import { AppStateProvider, AppLocaleProvider } from '../context';

export const WebTelegramApp = () => (
  <AppStateProvider>
    <AppLocaleProvider>
      <WebTelegramAppContent />
    </AppLocaleProvider>
  </AppStateProvider>
);
