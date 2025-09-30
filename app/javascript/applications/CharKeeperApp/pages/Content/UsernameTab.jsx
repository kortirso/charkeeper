import { Show, createEffect, createSignal, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Input, Button, Select } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';

export const UsernameTab = (props) => {
  const size = createWindowSize();

  const [username, setUsername] = createSignal('');
  const [colorSchema, setColorSchema] = createSignal('');
  const [localeValue, setLocaleValue] = createSignal(undefined);

  const [appState, { changeUserInfo }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict, { setLocale }] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    batch(() => {
      setUsername(appState.username);
      setColorSchema(appState.colorSchema);
      setLocaleValue(locale());
    });
  });

  const updateProfile = async () => {
    let payload = { color_schema: colorSchema(), locale: localeValue() };
    if (username() !== appState.username) payload = { ...payload, username: username() };

    const result = await updateUserRequest(appState.accessToken, payload);

    if (result.errors_list === undefined) {
      batch(() => {
        changeUserInfo({ username: username(), colorSchema: colorSchema() });
        setLocale(localeValue());
      });
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
          <p>{t('pages.settingsPage.profile')}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-auto">
        <Input
          containerClassList="mb-2"
          labelText={t('pages.settingsPage.username')}
          value={username()}
          onInput={(value) => setUsername(value)}
        />
        <Select
          containerClassList="mb-2"
          labelText={t('pages.settingsPage.locale')}
          items={{ 'en': 'English', 'ru': 'Русский' }}
          selectedValue={localeValue()}
          onSelect={(value) => setLocaleValue(value)}
        />
        <Select
          containerClassList="mb-4"
          labelText={t('pages.settingsPage.colorSchema')}
          items={{ 'light': 'Light', 'dark': 'Dark' }}
          selectedValue={colorSchema()}
          onSelect={(value) => setColorSchema(value)}
        />
        <Button default textable onClick={updateProfile}>{t('save')}</Button>
      </div>
    </>
  );
}
