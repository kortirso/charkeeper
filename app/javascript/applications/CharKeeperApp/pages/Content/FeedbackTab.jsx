import { createSignal, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Button, TextArea } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { createUserFeedbackRequest } from '../../requests/createUserFeedbackRequest';

export const FeedbackTab = (props) => {
  const size = createWindowSize();

  const [feedback, setFeedback] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const saveFeedback = async () => {
    if (feedback().length === 0) return;

    const result = await createUserFeedbackRequest(appState.accessToken, { value: feedback() });
    if (result.errors_list === undefined) {
      batch(() => {
        renderNotice(t('alerts.feedbackIsAdded'));
        setFeedback('');
      })
    } else renderAlerts(result.errors_list);
  }

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t('pages.settingsPage.feedback')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <TextArea
          rows="10"
          labelText={t('pages.settingsPage.feedback')}
          value={feedback()}
          onChange={(value) => setFeedback(value)}
        />
        <Button default textable classList="mt-2" onClick={saveFeedback}>{t('save')}</Button>
      </div>
    </>
  );
}
