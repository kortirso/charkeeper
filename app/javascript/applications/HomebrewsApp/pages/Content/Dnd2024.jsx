import { For, Switch, Match } from 'solid-js';

import {
  DndBooks, DndItems, DndWeapons
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    items: 'Items',
    weapons: 'Weapons'
  },
  ru: {
    books: 'Книги',
    items: 'Предметы',
    weapons: 'Оружие'
  }
}

export const Dnd2024 = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={['books', 'items', 'weapons']}>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePageParams.tab === item }}
              onClick={() => navigate('dnd2024', { tab: item })}
            >{TRANSLATION[locale()][item]}</p>
          }
        </For>
      </div>
      <Switch fallback={<></>}>
        <For each={
          Object.entries({
            books: DndBooks, items: DndItems, weapons: DndWeapons
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
