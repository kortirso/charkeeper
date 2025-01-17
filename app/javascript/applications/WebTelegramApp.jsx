import { WebTelegramAppContent } from './WebTelegramAppContent';

import { AppStateProvider, AppLocaleProvider } from '../context';

export const WebTelegramApp = (props) => (
  <AppStateProvider>
    <AppLocaleProvider>
      <WebTelegramAppContent />
    </AppLocaleProvider>
  </AppStateProvider>
);
