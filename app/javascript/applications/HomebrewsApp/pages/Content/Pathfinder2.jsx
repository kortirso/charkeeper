import { For, Switch, Match } from 'solid-js';

import { Pathfinder2Books, Pathfinder2Weapons, Pathfinder2Backgrounds } from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    weapons: 'Weapons',
    backgrounds: 'Backgrounds'
  },
  ru: {
    books: 'Книги',
    weapons: 'Оружие',
    backgrounds: 'Происхождения'
  },
  es: {
    books: 'Libros',
    weapons: 'Armas',
    backgrounds: 'Trasfondos'
  }
}

export const Pathfinder2 = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex flex-wrap gap-x-4 gap-y-2 my-4">
        <For each={
          [
            'books', 'backgrounds', 'weapons'
          ]
        }>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePageParams.tab === item }}
              onClick={() => navigate('pathfinder2', { tab: item })}
            >{TRANSLATION[locale()][item]}</p>
          }
        </For>
      </div>
      <Switch fallback={<></>}>
        <For each={
          Object.entries({
            books: Pathfinder2Books, weapons: Pathfinder2Weapons, backgrounds: Pathfinder2Backgrounds
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
