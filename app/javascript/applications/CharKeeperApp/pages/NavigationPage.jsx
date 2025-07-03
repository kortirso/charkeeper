import { createSignal, Switch, Match } from 'solid-js'; 

import { CharactersTab, HomebrewTab, SettingsTab } from '../pages';
import { IconButton } from '../components/atoms';
import { NotificationsBudge } from '../components/molecules';

import { List, Edit, Homebrew } from '../assets';

export const NavigationPage = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');

  // 453x750
  // 420x690
  return (
    <div class="flex flex-col w-full sm:w-96 md:border-r border-gray-200 bg-white">
      <div class="relative flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Match when={currentTab() === 'characters'}>
            <CharactersTab />
          </Match>
          <Match when={currentTab() === 'homebrew'}>
            <HomebrewTab />
          </Match>
          <Match when={currentTab() === 'settings'}>
            <SettingsTab />
          </Match>
        </Switch>
      </div>
      <div class="flex p-2 border-t border-gray-200">
        <div class="flex-1">
          <IconButton colored size="xl" classList="mx-auto" active={currentTab() === 'characters'} onClick={() => setCurrentTab('characters')}>
            <List />
          </IconButton>
        </div>
        <div class="flex-1">
          <IconButton colored size="xl" classList="mx-auto" active={currentTab() === 'homebrew'} onClick={() => setCurrentTab('homebrew')}>
            <Homebrew width={28} height={28} />
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
