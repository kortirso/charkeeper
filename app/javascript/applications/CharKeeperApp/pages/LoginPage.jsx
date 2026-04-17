import { createSignal, createEffect, Show, For, batch } from 'solid-js';

import { Input, Button, Select, Checkbox } from '../components';
import { useAppState, useAppLocale, useAppAlert } from '../context';
import { signUpRequest } from '../requests/signUpRequest';
import { signInRequest } from '../requests/signInRequest';
import { writeToCache, readFromCache, localize } from '../helpers';

const CHARKEEPER_HOST_CACHE_NAME = 'CharKeeperHost';
const USER_CREDENTIALS_CACHE_NAME = 'UserCredentials';
const TRANSLATION = {
  en: {
    region: 'Server region',
    euRegion: 'EU region',
    ruRegion: 'RU region',
    regionHelp: 'The servers operate independently of each other.',
    signin: 'Sign in',
    signup: 'Sign up',
    username: 'Username',
    password: 'Password (minimum 10 characters)',
    passwordConfirmation: 'Password confirmation',
    haveAccount: 'Already have account?',
    noAccount: "Don't have account?",
    remember: 'Remember password'
  },
  ru: {
    region: 'Регион сервера',
    euRegion: 'Евро регион',
    ruRegion: 'РУ регион',
    regionHelp: 'Серверы работают независимо от друг друга.',
    signin: 'Вход',
    signup: 'Регистрация',
    username: 'Имя пользователя',
    password: 'Пароль (минимум 10 символов)',
    passwordConfirmation: 'Подтверждение пароля',
    haveAccount: 'Уже есть аккаунт?',
    noAccount: 'Еще нет аккаунта?',
    remember: 'Запомнить пароль'
  },
  es: {
    region: 'Región del servidor',
    euRegion: 'Región EU',
    ruRegion: 'Región RU',
    regionHelp: 'Los servidores funcionan de forma independiente entre sí.',
    signin: 'Iniciar sesión',
    signup: 'Registrarse',
    username: 'Nombre de usuario',
    password: 'Contraseña (al menos 10 caracteres)',
    passwordConfirmation: 'Confirmación de contraseña',
    haveAccount: '¿Ya tienes una cuenta?',
    noAccount: '¿No tienes una cuenta?',
    remember: 'Remember password'
  }
}

export const LoginPage = () => {
  const [page, setPage] = createSignal('signin');
  const [username, setUsername] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordConfirmation, setPasswordConfirmation] = createSignal('');
  const [region, setRegion] = createSignal('charkeeper.org');
  const [remember, setRemember] = createSignal(true);

  const [, { changeUserInfo, setAccessToken }] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale,, { setLocale }] = useAppLocale();

  const readUserCredentials = async () => {
    const cacheValue = await readFromCache(USER_CREDENTIALS_CACHE_NAME);
    if (cacheValue) {
      const credentials = JSON.parse(cacheValue);
      batch(() => {
        setUsername(credentials.username || '');
        setPassword(credentials.password || '');
      });
    }
  }

  const readRegion = async () => {
    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    if (cacheValue) setRegion(cacheValue);
  }

  createEffect(() => {
    readUserCredentials();
    readRegion();
  });

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
    if (window.__TAURI_INTERNALS__) {
      writeToCache(CHARKEEPER_HOST_CACHE_NAME, region());
      writeToCache(
        USER_CREDENTIALS_CACHE_NAME,
        JSON.stringify(remember() ? { username: username(), password: password() } : {})
      );
    }

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
    if (window.__TAURI_INTERNALS__) {
      writeToCache(CHARKEEPER_HOST_CACHE_NAME, region());
      writeToCache(
        USER_CREDENTIALS_CACHE_NAME,
        JSON.stringify(remember() ? { username: username(), password: password() } : {})
      );
    }

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
        <h2 class="text-2xl mb-4">{localize(TRANSLATION, locale())[page()]}</h2>
        <Show when={window.__TAURI_INTERNALS__}>
          <Select
            containerClassList="mb-1"
            labelText={localize(TRANSLATION, locale()).region}
            items={{
              'charkeeper.org': localize(TRANSLATION, locale()).euRegion,
              'charkeeper.ru': localize(TRANSLATION, locale()).ruRegion,
            }}
            selectedValue={region()}
            onSelect={setRegion}
          />
          <p class="text-sm mb-2">{localize(TRANSLATION, locale()).regionHelp}</p>
        </Show>
        <Input
          containerClassList="form-field mb-2"
          labelText={localize(TRANSLATION, locale()).username}
          value={username()}
          onInput={setUsername}
        />
        <Input
          password
          containerClassList="form-field mb-2"
          labelText={localize(TRANSLATION, locale()).password}
          value={password()}
          onInput={setPassword}
        />
        <Show when={page() === 'signup'}>
          <Input
            password
            containerClassList="form-field mb-2"
            labelText={localize(TRANSLATION, locale()).passwordConfirmation}
            value={passwordConfirmation()}
            onInput={setPasswordConfirmation}
          />
        </Show>
        <Checkbox
          labelText={localize(TRANSLATION, locale()).remember}
          labelPosition="right"
          labelClassList="text-sm ml-4"
          classList="mb-2"
          checked={remember()}
          onToggle={() => setRemember(!remember())}
        />
        <Show
          when={page() === 'signin'}
          fallback={
            <p>
              {localize(TRANSLATION, locale()).haveAccount}
              <span class="ml-4 underline text-blue-600 cursor-pointer" onClick={() => setPage('signin')}>
                {localize(TRANSLATION, locale()).signin}
              </span>
            </p>
          }
        >
          <p>
            {localize(TRANSLATION, locale()).noAccount}
            <span class="ml-4 underline text-blue-600 cursor-pointer" onClick={() => setPage('signup')}>
              {localize(TRANSLATION, locale()).signup}
            </span>
          </p>
        </Show>
        <Button default textable classList="mt-2" onClick={page() === 'signin' ? signIn : signUp}>
          {localize(TRANSLATION, locale())[page()]}
        </Button>
      </div>
    </div>
  );
}
