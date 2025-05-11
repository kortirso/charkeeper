import * as i18n from '@solid-primitives/i18n';

import { PageHeader } from '../molecules';
import { Select, IconButton } from '../atoms';

import { Hamburger } from '../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateUserRequest } from '../../requests/updateUserRequest';

export const ProfilePage = (props) => {
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
      <PageHeader rightContent={<IconButton onClick={props.onNavigate}><Hamburger /></IconButton>}>
        {t('profilePage.title')}
      </PageHeader>
      <div class="p-3 flex-1 overflow-y-scroll">
        <div class="p-3 flex-1 flex flex-col white-box">
          <Select
            labelText={t('profilePage.changeLocale')}
            items={{ 'en': 'English', 'ru': 'Русский' }}
            selectedValue={locale()}
            onSelect={(value) => changeLocale(value)}
          />
        </div>
      </div>
    </>
  );
}
