import { createSignal, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Input, Button } from '../../components';
import { Arrow } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';
import { writeToCache, readFromCache, localize } from '../../helpers';

const USER_CREDENTIALS_CACHE_NAME = 'UserCredentials';
const TRANSLATION = {
  en: {
    password: 'Password (minimum 10 characters)',
    passwordConfirmation: 'Password confirmation',
    changePassword: 'Password',
    userIsUpdated: 'User is updated',
    save: 'Save'
  },
  ru: {
    password: 'Пароль (минимум 10 символов)',
    passwordConfirmation: 'Подтверждение пароля',
    changePassword: 'Пароль',
    userIsUpdated: 'Пользователь обновлён',
    save: 'Сохранить'
  },
  es: {
    password: 'Contraseña (al menos 10 caracteres)',
    passwordConfirmation: 'Confirmación de contraseña',
    changePassword: 'Contraseña',
    userIsUpdated: 'El usuario fue actualizado',
    save: 'Guardar'
  }
}

export const PasswordsTab = (props) => {
  const size = createWindowSize();

  const [password, setPassword] = createSignal('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  const refreshCredentials = async () => {
    const cacheValue = await readFromCache(USER_CREDENTIALS_CACHE_NAME);
    if (cacheValue) {
      const credentials = JSON.parse(cacheValue);
      writeToCache(
        USER_CREDENTIALS_CACHE_NAME,
        JSON.stringify({ username: credentials.username, password: password() })
      );
    }
  }

  const changePassword = async () => {
    const result = await updateUserRequest(appState.accessToken, { password: password(), password_confirmation: passwordConfirmation() });
    if (result.errors_list === undefined) {
      renderNotice(localize(TRANSLATION, locale()).userIsUpdated);
      refreshCredentials();
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
          <p>{localize(TRANSLATION, locale()).changePassword}</p>
        </PageHeader>
      </Show>
      <div class="p-4 flex-1 flex flex-col overflow-y-auto">
        <Input
          password
          containerClassList="mb-2"
          labelText={localize(TRANSLATION, locale()).password}
          value={password()}
          onInput={(value) => setPassword(value)}
        />
        <Input
          password
          containerClassList="mb-4"
          labelText={localize(TRANSLATION, locale()).passwordConfirmation}
          value={passwordConfirmation()}
          onInput={(value) => setPasswordConfirmation(value)}
        />
        <Button default textable onClick={changePassword}>{localize(TRANSLATION, locale()).save}</Button>
      </div>
    </>
  );
}
