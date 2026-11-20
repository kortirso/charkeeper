import { createMemo } from 'solid-js';

import { ContentNavButton } from '../components';
import { useAppLocale } from '../context';
import { List, Homebrew, Campaigns, Edit, Logo } from '../assets';
import { localize } from '../helpers';

const TRANSLATION = {
  en: {
    characters: 'Characters',
    homebrews: 'Homebrew',
    campaigns: 'Campaigns',
    settings: 'Settings'
  },
  ru: {
    characters: 'Персонажи',
    homebrews: 'Homebrew',
    campaigns: 'Кампании',
    settings: 'Настройки'
  },
  es: {
    characters: 'Personajes',
    homebrews: 'Homebrew',
    campaigns: 'Campañas',
    settings: 'Configuración'
  }
}

export const ContentLayout = () => {
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
        <div id="content-body">
          <div id="content-body-left" />
          <div id="content-body-right" />
        </div>
        <div id="content-nav">
          <ContentNavButton text={i18n().characters}><List /></ContentNavButton>
          <ContentNavButton text={i18n().homebrews}><Homebrew /></ContentNavButton>
          <ContentNavButton text={i18n().campaigns}><Campaigns /></ContentNavButton>
          <ContentNavButton text={i18n().settings}><Edit /></ContentNavButton>
        </div>
      </div>
    </div>
  );
}
