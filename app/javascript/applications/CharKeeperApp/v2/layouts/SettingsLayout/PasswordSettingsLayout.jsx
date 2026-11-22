import { createMemo, createSignal } from 'solid-js';

import { Input, Button } from '../../components';
import { useAppLocale, useAppState } from '../../context';
import { localize, performResponse, writeToCache, readFromCache } from '../../helpers';

import { updateUserRequest } from './api';

const TRANSLATION = {
  en: {
    password: 'Password (minimum 10 characters)',
    passwordConfirmation: 'Password confirmation',
    save: 'Save'
  },
  ru: {
    password: 'Пароль (минимум 10 символов)',
    passwordConfirmation: 'Подтверждение пароля',
    save: 'Сохранить'
  },
  es: {
    password: 'Contraseña (al menos 10 caracteres)',
    passwordConfirmation: 'Confirmación de contraseña',
    save: 'Guardar'
  }
}
const USER_CREDENTIALS_CACHE_NAME = 'UserCredentials';

export const PasswordSettingsLayout = () => {
  const [password, setPassword] = createSignal('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal('');

  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

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
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        refreshCredentials();
      }
    );
  }

  return (
    <div class="main-setting-layout">
      <Input type="password" label={i18n().password} onInput={setPassword} />
      <Input type="password" label={i18n().passwordConfirmation} onInput={setPasswordConfirmation} />
      <div>
        <Button onClick={changePassword}>{i18n().save}</Button>
      </div>
    </div>
  );
}
