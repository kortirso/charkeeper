import * as i18n from '@solid-primitives/i18n';

import { PageHeader } from '../../components/molecules';
import { Telegram, Discord, Vk } from '../../assets';

import { useAppState, useAppLocale } from '../../context';

export const SettingsTab = () => {
  const [appState, { navigate }] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderSettingsLink = (title, link) => (
    <p
      class="py-3 px-4 cursor-pointer rounded"
      classList={{
        'bg-blue-400 text-white': appState.activePage === link,
        'bg-white text-black hover:bg-gray-100': appState.activePage !== link
      }}
      onClick={() => navigate(link, {})}
    >
      {title}
    </p>
  );

  // 453x750
  // 420x690
  return (
    <>
      <PageHeader>
        {t('settingsPage.title')}
      </PageHeader>
      <div class="p-4 flex-1 overflow-y-scroll">
        {renderSettingsLink(t('settingsPage.profile'), 'profile')}
        {renderSettingsLink(t('settingsPage.changeLocale'), 'locale')}
        {renderSettingsLink(t('settingsPage.feedback'), 'feedback')}
        <div class="flex py-3 px-4 gap-4">
          <p>{t('settingsPage.socials')}</p>
          <a href="https://discord.gg/NFqWPkuZ" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
            <Discord />
          </a>
          <a href="https://vk.com/char_keeper" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
            <Vk />
          </a>
          <a href="https://t.me/charkeeper" target="_blank" rel="noopener noreferrer" class="opacity-75 hover:opacity-100">
            <Telegram />
          </a>
        </div>
      </div>
    </>
  );
}
