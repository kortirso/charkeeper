import { createMemo, For, Show, children } from 'solid-js';

import { ContentNavButton, Select } from '../components';
import { useAppLocale } from '../context';
import { List, Homebrew, Campaigns, Edit, Logo } from '../assets';
import { localize } from '../helpers';

const TRANSLATION = {
  en: {
    characters: 'Characters',
    homebrews: 'Homebrews',
    campaigns: 'Campaigns',
    settings: 'Settings',
    noSelection: 'Select character'
  },
  ru: {
    characters: 'Персонажи',
    homebrews: 'Homebrews',
    campaigns: 'Кампании',
    settings: 'Настройки',
    noSelection: 'Выберите персонажа'
  },
  es: {
    characters: 'Personajes',
    homebrews: 'Homebrews',
    campaigns: 'Campañas',
    settings: 'Configuración',
    noSelection: 'Seleccionar personaje'
  }
}

export const ContentLayout = (props) => {
  const safeChildren = children(() => props.children);

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const charactersList = createMemo(() => {
    if (!props.characters) return {};

    return props.characters.reduce((acc, item) => { acc[item.id] = item.name; return acc }, {});
  });

  const selectCharacter = (id) => props.onChangeCharacter(props.characters.find((item) => item.id === id));

  return (
    <div id="content-layout">
      <div id="content-header">
        <div id="content-header-logo">
          <Logo />
        </div>
        <Show when={props.characters && props.characterId}>
          <div class="content-header-character-select">
            <Select
              placeholder={i18n().noSelection}
              options={charactersList()}
              onSelect={selectCharacter}
              value={props.characterId}
            />
          </div>
        </Show>
      </div>
      <div id="content">
        {safeChildren()}
        <div id="content-nav">
          <For each={[['characters', <List />], ['homebrews', <Homebrew />], ['campaigns', <Campaigns />], ['settings', <Edit />]]}>
            {(item) =>
              <ContentNavButton active={props.currentTab === item[0]} text={i18n()[item[0]]} onClick={() => props.onChangeTab(item[0])}>
                {item[1]}
              </ContentNavButton>
            }
          </For>
        </div>
      </div>
    </div>
  );
}
