import { WebTelegramAppContent } from './WebTelegramAppContent';

import { AppStateProvider } from '../context/appState';

export const WebTelegramApp = (props) => (
  <AppStateProvider>
    <WebTelegramAppContent />
  </AppStateProvider>
);
