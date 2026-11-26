import { createEffect, createMemo, createSignal, For, Show, batch } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { useAppLocale, useAppState } from '../../context';
import { localize, apiRequest, options } from '../../helpers';

const TRANSLATION = {
  en: {
    general: 'General',
    loading: 'Loading character…',
    loadError: 'Could not load character data.'
  },
  ru: {
    general: 'Общее',
    loading: 'Загружаем персонажа…',
    loadError: 'Не удалось загрузить данные персонажа.'
  },
  es: {
    general: 'General',
    loading: 'Cargando personaje…',
    loadError: 'No se pudieron cargar los datos del personaje.'
  }
}

export const fetchCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/characters/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const Character = (props) => {
  const [character, setCharacter] = createSignal(undefined);
  const [activeTab, setActiveTab] = createSignal('general');

  const size = createWindowSize();
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));
  const isDesktop = () => size.width >= 1280;

  const visibleTabs = createMemo(() => isDesktop() ? props.tabs.filter((tab) => tab.id !== 'general') : props.tabs);
  const selectedTab = createMemo(() => props.tabs.find((tab) => tab.id === activeTab()));

  createEffect(() => {
    if (!props.character?.id) return;
    if (character() && props.character?.id === character().id) return;

    fetchCharacterRequest(appState.accessToken, props.character.id).then((data) => {
      batch(() => {
        if (data.character) setCharacter(data.character);
        setActiveTab(isDesktop() ? props.tabs[1]?.id : 'general');
      });
    });
  });

  const renderGeneral = (avatar) => (
    <Show when={character()} fallback={<div class="loading">{i18n().loading}</div>}>
      <Dynamic component={props.tabs[0].component} character={character()} avatar={avatar} />
    </Show>
  );

  return (
    <>
      <Show when={isDesktop()}>
        <div id="content-body-left" class="character-general-pane">{renderGeneral(props.character?.avatar)}</div>
      </Show>
      <div id="content-body-right" class="character-workspace">
        <nav class="character-tabs" aria-label={i18n().general}>
          <For each={visibleTabs()}>
            {(tab) =>
              <button type="button" class="character-tab" classList={{ active: activeTab() === tab.id }} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </button>
            }
          </For>
        </nav>
        <div class="character-tab-content">
          <Show
            when={activeTab() === 'general'}
            fallback={
              <Show when={selectedTab()?.component}>
                <Dynamic component={selectedTab().component} character={character()} />
              </Show>
            }
          >
            <Show when={!isDesktop()}>{renderGeneral(props.character?.avatar)}</Show>
          </Show>
        </div>
      </div>
    </>
  );
}
