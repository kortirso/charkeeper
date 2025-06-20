import * as i18n from '@solid-primitives/i18n';

import { PageHeader } from '../../components/molecules';
import { Select } from '../../components/atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';

export const SettingsTab = () => {
  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict, { setLocale }] = useAppLocale();

  const t = i18n.translator(dict);

  const changeLocale = async (value) => {
    const result = await updateUserRequest(appState.accessToken, { locale: value });
    if (result.errors === undefined) setLocale(value);
    else renderAlerts(result.errors);
  }

  // 453x750
  // 420x690
  return (
    <>
      <PageHeader>
        {t('settingsPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <Select
          labelText={t('settingsPage.changeLocale')}
          items={{ 'en': 'English', 'ru': 'Русский' }}
          selectedValue={locale()}
          onSelect={(value) => changeLocale(value)}
        />
      </div>
    </>
  );
}
