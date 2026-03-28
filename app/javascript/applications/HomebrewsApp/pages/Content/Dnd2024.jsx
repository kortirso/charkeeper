import { For, Switch, Match } from 'solid-js';

import {
  DndBooks, DndItems, DndWeapons, DndSubclasses, DndSpells, DndFeats
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    items: 'Items',
    weapons: 'Weapons',
    subclasses: 'Subclasses',
    spells: 'Spells',
    feats: 'Feats'
  },
  ru: {
    books: 'Книги',
    items: 'Предметы',
    weapons: 'Оружие',
    subclasses: 'Подклассы',
    spells: 'Заклинания',
    feats: 'Черты'
  }
}

export const Dnd2024 = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={['books', 'items', 'weapons', 'subclasses', 'spells', 'feats']}>
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
            books: DndBooks, items: DndItems, weapons: DndWeapons, subclasses: DndSubclasses, spells: DndSpells, feats: DndFeats
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
