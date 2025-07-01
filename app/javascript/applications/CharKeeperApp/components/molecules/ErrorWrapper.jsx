import { ErrorBoundary } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppState, useAppLocale } from '../../context';
import { createMonitoringRequest } from '../../requests/createMonitoringRequest';

export const ErrorWrapper = (props) => {
  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const sendError = async (error) => {
    await createMonitoringRequest(appState.accessToken, { payload: { ...props.payload, message: error.message } });
  }

  return (
    <ErrorBoundary
      fallback={(error) => {
        sendError(error);
        return (
          <div class="white-box p-4">
            <p>{t('alerts.error')}</p>
          </div>
        );
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}
