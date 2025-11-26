import { createSignal, Switch, Match } from 'solid-js'; 

import { CharactersTab, SettingsTab, CampaignsTab, BotTab } from '../pages';
import { IconButton, NotificationsBudge } from '../components';
import { List, Edit, Campaigns, Chat } from '../assets';

export const NavigationPage = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');

  // 453x750
  // 420x690
  return (
    <div class="flex flex-col w-full md:w-96 md:border-r border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700">
      <div class="relative flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Match when={currentTab() === 'characters'}>
            <CharactersTab />
          </Match>
          <Match when={currentTab() === 'campaigns'}>
            <CampaignsTab />
          </Match>
          <Match when={currentTab() === 'bot'}>
            <BotTab />
          </Match>
          <Match when={currentTab() === 'settings'}>
            <SettingsTab />
          </Match>
        </Switch>
      </div>
      <div class="flex p-2 border-t border-gray-200 dark:bg-neutral-800 dark:border-neutral-700">
        <div class="flex-1">
          <IconButton colored size="xl" classList="mx-auto" active={currentTab() === 'characters'} onClick={() => setCurrentTab('characters')}>
            <List />
          </IconButton>
        </div>
        <div class="flex-1">
          <IconButton colored size="xl" classList="mx-auto" active={currentTab() === 'campaigns'} onClick={() => setCurrentTab('campaigns')}>
            <Campaigns />
          </IconButton>
        </div>
        <div class="flex-1">
          <IconButton colored size="xl" classList="mx-auto" active={currentTab() === 'bot'} onClick={() => setCurrentTab('bot')}>
            <Chat width={28} height={28} />
          </IconButton>
        </div>
        <div class="flex-1">
          <IconButton colored size="xl" classList="relative mx-auto" active={currentTab() === 'settings'} onClick={() => setCurrentTab('settings')}
          >
            <NotificationsBudge positionStyle="-top-0.5 -right-0.5" />
            <Edit width={28} height={28} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
