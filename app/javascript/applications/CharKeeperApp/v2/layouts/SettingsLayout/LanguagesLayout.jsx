import { createMemo } from 'solid-js';

import { Select } from '../../components';
import { useAppLocale, useAppState } from '../../context';
import { localize, performResponse } from '../../helpers';

import { updateUserRequest } from './api';

const TRANSLATION = {
  en: {
    localeValue: 'System language'
  },
  ru: {
    localeValue: 'Системный язык'
  },
  es: {
    localeValue: 'Idioma del sistema'
  }
}
const LANGUAGES = { en: 'English', ru: 'Русский', es: 'Español' };

export const LanguagesLayout = () => {
  const [locale, { setLocale }] = useAppLocale();
  const [appState, { changeUserInfo }] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const updateLanguage = (value) => {
    updateProfile(
      { locale: value },
      function() {
        changeUserInfo({ locale:value });
        setLocale(value);
      }
    );
  }

  const updateProfile = async (payload, successCallback) => {
    const result = await updateUserRequest(appState.accessToken, payload);
    performResponse(result, successCallback);
  }

  return (
    <div class="main-setting-layout">
      <Select label={i18n().localeValue} options={LANGUAGES} onSelect={updateLanguage} value={locale()} />
    </div>
  );
}
