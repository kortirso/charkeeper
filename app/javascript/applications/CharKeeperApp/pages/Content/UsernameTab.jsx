import { Show, createEffect, createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader } from '../../components/molecules';
import { IconButton, Input, Button } from '../../components/atoms';
import { Arrow } from '../../assets';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';

export const UsernameTab = (props) => {
  const size = createWindowSize();

  const [username, setUsername] = createSignal('');

  const [appState, { changeUsername }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    setUsername(appState.username);
  });

  const updateUsername = async () => {
    const result = await updateUserRequest(appState.accessToken, { username: username() });

    if (result.errors === undefined) changeUsername(username());
    else renderAlerts(result.errors);
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
          <p>{t('settingsPage.profile')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <div class="form-field">
          <Input
            containerClassList="mb-2"
            labelText={t('settingsPage.username')}
            value={username()}
            onInput={(value) => setUsername(value)}
          />
        </div>
        <Button default textable onClick={updateUsername}>{t('save')}</Button>
      </div>
    </>
  );
}
