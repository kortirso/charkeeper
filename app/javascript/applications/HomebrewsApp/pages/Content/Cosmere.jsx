import { For, Switch, Match } from 'solid-js';

import { CosmereSettings, CosmereBooks, CosmereCultures, CosmereAncestries, CosmereSpecializations } from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    settings: 'Settings',
    cultures: 'Cultures',
    ancestries: 'Ancestries',
    specializations: 'Specializations'
  },
  ru: {
    books: 'Книги',
    settings: 'Сеттинги',
    cultures: 'Культуры',
    ancestries: 'Наследия',
    specializations: 'Специализации'
  },
  es: {
    books: 'Libros',
    settings: 'Settings',
    cultures: 'Cultures',
    ancestries: 'Ancestries',
    specializations: 'Specializations'
  }
}

export const Cosmere = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex flex-wrap gap-x-4 gap-y-2 my-4">
        <For each={
          [
            'books', 'settings', 'cultures', 'ancestries', 'specializations'
          ]
        }>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePageParams.tab === item }}
              onClick={() => navigate('cosmere', { tab: item })}
            >{TRANSLATION[locale()][item]}</p>
          }
        </For>
      </div>
      <Switch fallback={<></>}>
        <For each={
          Object.entries({
            settings: CosmereSettings, books: CosmereBooks, cultures: CosmereCultures, ancestries: CosmereAncestries,
            specializations: CosmereSpecializations
          })
        }>
          {([item, Component]) =>
            <Match when={appState.activePageParams.tab === item}>
              <Component />
            </Match>
          }
        </For>
      </Switch>
    </>
  );
}
