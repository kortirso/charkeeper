import { createSignal, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Input, Button } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';

export const PasswordsTab = (props) => {
  const size = createWindowSize();

  const [password, setPassword] = createSignal('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const changePassword = async () => {
    const result = await updateUserRequest(appState.accessToken, { password: password(), password_confirmation: passwordConfirmation() });
    if (result.errors_list === undefined) renderNotice(t('alerts.userIsUpdated'));
    else renderAlerts(result.errors_list);
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
          <p>{t('pages.settingsPage.changePassword')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <Input
          password
          containerClassList="mb-2"
          labelText={t('pages.loginPage.password')}
          value={password()}
          onInput={(value) => setPassword(value)}
        />
        <Input
          password
          containerClassList="mb-4"
          labelText={t('pages.loginPage.passwordConfirmation')}
          value={passwordConfirmation()}
          onInput={(value) => setPasswordConfirmation(value)}
        />
        <Button default textable onClick={changePassword}>{t('save')}</Button>
      </div>
    </>
  );
}
