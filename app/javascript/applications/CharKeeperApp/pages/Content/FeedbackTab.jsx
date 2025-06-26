import { createSignal, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader } from '../../components/molecules';
import { IconButton, Button } from '../../components/atoms';
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
    if (result.errors === undefined) {
      batch(() => {
        renderNotice(t('alerts.feedbackIsAdded'));
        setFeedback('');
      })
    } else renderAlerts(result.errors);
  }

  return (
    <>
      <Show when={size.width < 768}>
        <PageHeader
          leftContent={
            <IconButton size="xl" onClick={props.onNavigate}>
              <Arrow back width={20} height={20} />
            </IconButton>
          }
        >
          <p>{t('settingsPage.feedback')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <div class="form-field">
          <label class="text-sm/4 font-cascadia-light text-gray-400">{t('settingsPage.feedback')}</label>
          <textarea
            rows="10"
            class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
            onInput={(e) => setFeedback(e.target.value)}
            value={feedback()}
          />
        </div>
        <Button default textable onClick={saveFeedback}>{t('save')}</Button>
      </div>
    </>
  );
}
