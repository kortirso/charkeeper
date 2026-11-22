import { createMemo } from 'solid-js';

import { Select } from '../../components';
import { useAppLocale, useAppState } from '../../context';
import { localize, performResponse } from '../../helpers';

import { updateUserRequest } from './api';

const TRANSLATION = {
  en: {
    colorSchema: 'Color schema',
    schemas: [
      { label: 'Light', value: 'light' },
      { label: 'Dark', value: 'dark' }
    ],
    colorTheme: 'Color theme'
  },
  ru: {
    colorSchema: 'Цветовая схема',
    schemas: [
      { label: 'Светлая', value: 'light' },
      { label: 'Тёмная', value: 'dark' }
    ],
    colorTheme: 'Цветовая тема'
  },
  es: {
    colorSchema: 'Esquema de colores',
    schemas: [
      { label: 'Luz', value: 'light' },
      { label: 'Oscuridad', value: 'dark' }
    ],
    colorTheme: 'Tema de color'
  }
}
const THEMES = [
  { label: 'Crimson', value: 'crimson' },
  { label: 'Ocean', value: 'ocean' },
  { label: 'Forest', value: 'forest' }
];

export const MainSettingsLayout = () => {
  const [locale] = useAppLocale();
  const [appState, { changeUserInfo }] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const updateSchema = (value) => updateProfile({ color_schema: value }, function() { changeUserInfo({ colorSchema: value }) });
  const updateTheme = (value) => updateProfile({ color_theme: value }, function() { changeUserInfo({ colorTheme: value }) });

  const updateProfile = async (payload, successCallback) => {
    const result = await updateUserRequest(appState.accessToken, payload);
    performResponse(result, successCallback);
  }

  return (
    <div class="main-setting-layout">
      <Select label={i18n().colorSchema} options={i18n().schemas} onSelect={updateSchema} value={appState.colorSchema} />
      <Select label={i18n().colorTheme} options={THEMES} onSelect={updateTheme} value={appState.colorTheme} />
    </div>
  );
}
