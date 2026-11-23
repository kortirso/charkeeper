import { createMemo, createSignal, For, Show, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { MainSettingsLayout, PasswordSettingsLayout, LanguagesLayout } from '../layouts';
import { LayoutNavButton, BackToListButton } from '../components';
import { AuthenticationSettings, LanguageSettings, MainSettings } from '../assets';
import { useAppLocale } from '../context';
import { localize } from '../helpers';

const SETTINGS = [
  { key: 'main', icon: MainSettings },
  { key: 'language', icon: LanguageSettings },
  { key: 'password', icon: AuthenticationSettings }
];

const TRANSLATION = {
  en: {
    titles: {
      main: 'Main settings',
      password: 'Authentication',
      language: 'Language settings'
    },
    descriptions: {
      main: 'Theme, color schema',
      password: 'Password, identities',
      language: 'System language, alternative translations'
    }
  },
  ru: {
    titles: {
      main: 'Основные настройки',
      password: 'Аутентификация',
      language: 'Языковые настройки'
    },
    descriptions: {
      main: 'Тема, цветовая схема',
      password: 'Смена пароля',
      language: 'Системный язык, альтернативные переводы'
    }
  },
  es: {
    titles: {
      main: 'Configuración principal',
      password: 'Autenticación',
      language: 'Configuración de idioma'
    },
    descriptions: {
      main: 'Tema, esquema de colores',
      password: 'Contraseña, identidades',
      language: 'Idioma del sistema, traducciones alternativas'
    }
  }
}

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = createSignal(undefined);

  const size = createWindowSize();
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  return (
    <div id="content-body">
      <Show when={size.width >= 1280 || !activeTab()}>
        <div id="content-body-left">
          <For each={SETTINGS}>
            {(item) =>
              <LayoutNavButton icon={item.icon} title={i18n().titles[item.key]} description={i18n().descriptions[item.key]} active={activeTab() === item.key} onClick={() => setActiveTab(item.key)} />
            }
          </For>
        </div>
      </Show>
      <Show when={size.width >= 1280 || activeTab()}>
        <div id="content-body-right">
          <Show when={size.width < 1280}>
            <BackToListButton onClick={() => setActiveTab(undefined)} />
          </Show>
          <Switch>
            <Match when={activeTab() === 'main'}>
              <MainSettingsLayout />
            </Match>
            <Match when={activeTab() === 'password'}>
              <PasswordSettingsLayout />
            </Match>
            <Match when={activeTab() === 'language'}>
              <LanguagesLayout />
            </Match>
          </Switch>
        </div>
      </Show>
    </div>
  );
}
