import { For, Switch, Match } from 'solid-js';

import { NimbleAncestries, NimbleBooks, NimbleWeapons } from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    ancestries: 'Ancestries',
    weapons: 'Weapons',
  },
  ru: {
    books: 'Книги',
    ancestries: 'Расы',
    weapons: 'Оружие',
  },
  es: {
    books: 'Libros',
    ancestries: 'Ancestrías',
    weapons: 'Armas'
  }
}

export const Nimble = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex flex-wrap gap-x-4 gap-y-2 my-4">
        <For each={
          [
            'books', 'ancestries', 'weapons'
          ]
        }>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePageParams.tab === item }}
              onClick={() => navigate('nimble', { tab: item })}
            >{TRANSLATION[locale()][item]}</p>
          }
        </For>
      </div>
      <Switch fallback={<></>}>
        <For each={
          Object.entries({
            ancestries: NimbleAncestries, books: NimbleBooks, weapons: NimbleWeapons
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
