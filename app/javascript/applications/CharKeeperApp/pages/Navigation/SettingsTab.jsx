import { Show } from 'solid-js'; 
import * as i18n from '@solid-primitives/i18n';

import { PageHeader, NotificationsBudge } from '../../components';
import { Telegram, Discord, Vk } from '../../assets';
import { useAppState, useAppLocale } from '../../context';
import { logoutRequest } from '../../requests/logoutRequest';

export const SettingsTab = () => {
  const [appState, { navigate, setAccessToken }] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderSettingsLink = (title, link) => (
    <p
      class="relative py-3 px-4 cursor-pointer rounded"
      classList={{
        'bg-blue-400 text-white dark:bg-fuzzy-red': appState.activePage === link,
        'text-black hover:bg-gray-100 dark:text-snow dark:hover:bg-dusty': appState.activePage !== link
      }}
      onClick={() => navigate(link, {})}
    >
      <Show when={link === 'notifications'}>
        <NotificationsBudge positionStyle="top-1 left-0" />
      </Show>
      {title}
    </p>
  );

  const logout = async () => {
    const result = await logoutRequest(appState.accessToken);

    if (result.errors === undefined) setAccessToken(null);
  }

  // 453x750
  // 420x690
  return (
    <>
      <PageHeader>
        {t('pages.settingsPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-y-scroll">
        <div class="flex-1">
          {renderSettingsLink(t('pages.settingsPage.profile'), 'profile')}
          {renderSettingsLink(t('pages.settingsPage.changePassword'), 'passwords')}
          {renderSettingsLink(t('pages.settingsPage.notifications'), 'notifications')}
          {renderSettingsLink(t('pages.settingsPage.feedback'), 'feedback')}
          <div class="flex py-3 px-4 gap-4">
            <p class="dark:text-snow">{t('pages.settingsPage.socials')}</p>
            <a href="https://discord.gg/fJVjhuef" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
              <Discord />
            </a>
            <a href="https://vk.com/char_keeper" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
              <Vk />
            </a>
            <a href="https://t.me/charkeeper" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
              <Telegram />
            </a>
          </div>
          <p
            class="py-3 px-4 cursor-pointer rounded hover:bg-gray-100 dark:text-snow dark:hover:bg-dusty"
            onClick={logout}
          >
            {t('pages.settingsPage.logout')}
          </p>
        </div>
        <p class="py-3 px-4 dark:text-snow">{t('pages.settingsPage.version')} 0.2.19, 2025.08.27</p>
      </div>
    </>
  );
}
