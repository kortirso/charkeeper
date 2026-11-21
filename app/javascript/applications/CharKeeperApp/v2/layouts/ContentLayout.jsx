import { createMemo, createSignal, For, Switch, Match } from 'solid-js';

import { CharactersLayout, HomebrewsLayout, CampaignsLayout, SettingsLayout } from '../layouts';
import { ContentNavButton } from '../components';
import { useAppLocale } from '../context';
import { List, Homebrew, Campaigns, Edit, Logo } from '../assets';
import { localize } from '../helpers';

const TRANSLATION = {
  en: {
    characters: 'Characters',
    homebrews: 'Homebrews',
    campaigns: 'Campaigns',
    settings: 'Settings'
  },
  ru: {
    characters: 'Персонажи',
    homebrews: 'Homebrews',
    campaigns: 'Кампании',
    settings: 'Настройки'
  },
  es: {
    characters: 'Personajes',
    homebrews: 'Homebrews',
    campaigns: 'Campañas',
    settings: 'Configuración'
  }
}

export const ContentLayout = () => {
  const [currentTab, setCurrentTab] = createSignal('characters');

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  return (
    <div id="content-layout">
      <div id="content-header">
        <div id="content-header-logo">
          <Logo />
        </div>
      </div>
      <div id="content">
        <Switch>
          <Match when={currentTab() === 'characters'}><CharactersLayout /></Match>
          <Match when={currentTab() === 'homebrews'}><HomebrewsLayout /></Match>
          <Match when={currentTab() === 'campaigns'}><CampaignsLayout /></Match>
          <Match when={currentTab() === 'settings'}><SettingsLayout /></Match>
        </Switch>
        <div id="content-nav">
          <For each={[['characters', <List />], ['homebrews', <Homebrew />], ['campaigns', <Campaigns />], ['settings', <Edit />]]}>
            {(item) =>
              <ContentNavButton active={currentTab() === item[0]} text={i18n()[item[0]]} onClick={() => setCurrentTab(item[0])}>
                {item[1]}
              </ContentNavButton>
            }
          </For>
        </div>
      </div>
    </div>
  );
}
