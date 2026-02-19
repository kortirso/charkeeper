import { Show, createEffect, createSignal, createMemo, batch, For, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { PageHeader, IconButton, Input, Button, Select, Label } from '../../components';
import { Arrow, Google, Discord, Telegram, Close } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';
import { removeIdentityRequest } from '../../requests/removeIdentityRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    existingIdentities: 'Existing identities',
    availableIdentities: 'Available identities',
    connected: 'Everything is connected',
    light: 'Light',
    dark: 'Dark',
    username: 'Username',
    locale: 'Locale',
    colorSchema: 'Color schema'
  },
  ru: {
    existingIdentities: 'Подключенные сервисы',
    availableIdentities: 'Доступные сервисы',
    connected: 'Всё подключено',
    light: 'Светлая',
    dark: 'Тёмная',
    username: 'Имя пользователя',
    locale: 'Язык',
    colorSchema: 'Цветовая палитра'
  }
}

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

  const identityProviders = createMemo(() => {
    if (appState.identities === undefined) return [];

    return appState.identities.map((item) => item.provider);
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

  const removeIdentity = async (id) => {
    await removeIdentityRequest(appState.accessToken, id);
    window.location.href = '/';
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
          labelText={localize(TRANSLATION, locale())['username']}
          value={username()}
          onInput={(value) => setUsername(value)}
        />
        <Select
          containerClassList="mb-2"
          labelText={localize(TRANSLATION, locale())['locale']}
          items={{ 'en': 'English', 'ru': 'Русский' }}
          selectedValue={localeValue()}
          onSelect={(value) => setLocaleValue(value)}
        />
        <Select
          containerClassList="mb-2"
          labelText={localize(TRANSLATION, locale())['colorSchema']}
          items={{ 'light': localize(TRANSLATION, locale())['light'], 'dark': localize(TRANSLATION, locale())['dark'] }}
          selectedValue={colorSchema()}
          onSelect={(value) => setColorSchema(value)}
        />
        <Show when={appState.identities !== undefined}>
          <div class="mb-2 grid grid-cols-1 emd:grid-cols-2 gap-2">
            <div>
              <Label labelText={localize(TRANSLATION, locale())['existingIdentities']} />
              <table class="table border border-gray-200 bg-white dark:bg-neutral-700 dark:border-gray-500 dark:text-snow">
                <tbody>
                  <For each={appState.identities}>
                    {(identity) =>
                      <tr>
                        <td class="flex p-1">
                          <Switch>
                            <Match when={identity.provider === 'discord'}><Discord /></Match>
                            <Match when={identity.provider === 'google'}><Google /></Match>
                            <Match when={identity.provider === 'telegram'}><Telegram /></Match>
                          </Switch>
                          <p class="dark:text-snow ml-4">{identity.uid}</p>
                        </td>
                        <td class="p-1">
                          <IconButton onClick={() => removeIdentity(identity.id)}>
                            <Close />
                          </IconButton>
                        </td>
                      </tr>
                    }
                  </For>
                </tbody>
              </table>
            </div>
            <div>
              <Label labelText={localize(TRANSLATION, locale())['availableIdentities']} />
              <Show
                when={['google', 'discord', 'telegram'].filter((item) => !identityProviders().includes(item)).length > 0}
                fallback={
                  <p class="dark:text-snow">{localize(TRANSLATION, locale())['connected']}</p>
                }
              >
                <div class="p-1">
                  <For each={['google', 'discord', 'telegram'].filter((item) => !identityProviders().includes(item))}>
                    {(provider) =>
                      <Switch>
                        <Match when={provider === 'discord'}><a href={appState.oauthLinks.discord}><Discord /></a></Match>
                        <Match when={provider === 'google'}><a href={appState.oauthLinks.google}><Google /></a></Match>
                        <Match when={provider === 'telegram'}>
                          <script
                            async
                            src="https://telegram.org/js/telegram-widget.js?22"
                            data-telegram-login={appState.oauthCredentials.telegram.botName}
                            data-size="medium"
                            data-userpic="false"
                            data-radius="0"
                            data-auth-url={appState.oauthCredentials.telegram.redirectUrl}
                            data-request-access="write"
                          />
                        </Match>
                      </Switch>
                    }
                  </For>
                </div>
              </Show>
            </div>
          </div>
        </Show>
        <Button default textable classList="mt-4" onClick={updateProfile}>{t('save')}</Button>
      </div>
    </>
  );
}
