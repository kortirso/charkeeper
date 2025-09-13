import { createSignal, Switch, Match, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button } from '../components';
import { useAppState, useAppLocale, useAppAlert } from '../context';
import { signUpRequest } from '../requests/signUpRequest';
import { signInRequest } from '../requests/signInRequest';

export const LoginPage = () => {
  const [page, setPage] = createSignal('signin');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal('');

  const [, { changeUserInfo, setAccessToken }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict, { setLocale }] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchPlatformData = () => {
    if (!window.__TAURI_INTERNALS__) return null;

    try {
      const { platform } = window.__TAURI__.os;
      return platform();
    } catch(e) {
      console.log(e.message);
      return null;
    }
  }

  const signUp = async () => {
    const platformData = fetchPlatformData();
    const result = await signUpRequest(
      {
        user: { username: username(), password: password(), password_confirmation: passwordConfirmation() },
        platform: platformData
      }
    );
    checkSignResult(result);
  }

  const signIn = async () => {
    const platformData = fetchPlatformData();
    const result = await signInRequest({ user: { username: username(), password: password() }, platform: platformData });
    checkSignResult(result);
  }

  const checkSignResult = (result) => {
    if (result.errors_list === undefined) {
      batch(() => {
        setLocale(result.locale);
        setAccessToken(result.access_token);
        changeUserInfo({
          username: result.username,
          isAdmin: result.admin,
          colorSchema: result.color_schema
        });
      });
    } else {
      renderAlerts(result.errors_list);
    }
  }

  return (
    <div class="min-h-screen flex flex-col justify-center items-center">
      <div class="max-w-sm w-full p-4">
        <Switch>
          <Match when={page() === 'signin'}>
            <h2 class="text-2xl mb-4">{t('pages.loginPage.signin')}</h2>
          </Match>
          <Match when={page() === 'signup'}>
            <h2 class="text-2xl mb-4">{t('pages.loginPage.signup')}</h2>
          </Match>
        </Switch>
        <Input
          containerClassList="form-field mb-2"
          labelText={t('pages.loginPage.username')}
          value={username()}
          onInput={(value) => setUsername(value)}
        />
        <Input
          password
          containerClassList="form-field mb-2"
          labelText={t('pages.loginPage.password')}
          value={password()}
          onInput={(value) => setPassword(value)}
        />
        <Switch>
          <Match when={page() === 'signin'}>
            <p>
              {t('pages.loginPage.noAccount')}
              <span class="ml-4 underline text-blue-600 cursor-pointer" onClick={() => setPage('signup')}>
                {t('pages.loginPage.signup')}
              </span>
            </p>
            <Button default textable classList="mt-2" onClick={signIn}>{t('pages.loginPage.signin')}</Button>
          </Match>
          <Match when={page() === 'signup'}>
            <Input
              password
              containerClassList="form-field mb-2"
              labelText={t('pages.loginPage.passwordConfirmation')}
              value={passwordConfirmation()}
              onInput={(value) => setPasswordConfirmation(value)}
            />
            <p>
              {t('pages.loginPage.haveAccount')}
              <span class="ml-4 underline text-blue-600 cursor-pointer" onClick={() => setPage('signin')}>
                {t('pages.loginPage.signin')}
              </span>
            </p>
            <Button default textable classList="mt-2" onClick={signUp}>{t('pages.loginPage.signup')}</Button>
          </Match>
        </Switch>
      </div>
    </div>
  );
}
