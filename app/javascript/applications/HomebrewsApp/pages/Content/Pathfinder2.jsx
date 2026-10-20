import { For, Switch, Match } from 'solid-js';

import {
  Pathfinder2Books, Pathfinder2Weapons, Pathfinder2Backgrounds, Pathfinder2Armors, Pathfinder2Shields, Pathfinder2Items,
  Pathfinder2Consumables, Pathfinder2Classes, Pathfinder2Subclasses, Pathfinder2Feats, Pathfinder2Spells
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    weapons: 'Weapons',
    backgrounds: 'Backgrounds',
    classes: 'Classes',
    subclasses: 'Subclasses',
    items: 'Items',
    armor: 'Armor',
    shields: 'Shields',
    consumables: 'Consumables',
    spells: 'Spells',
    feats: 'Feats'
  },
  ru: {
    books: 'Книги',
    weapons: 'Оружие',
    backgrounds: 'Происхождения',
    classes: 'Классы',
    subclasses: 'Подклассы',
    items: 'Предметы',
    armor: 'Броня',
    shields: 'Щиты',
    consumables: 'Расходники',
    spells: 'Заклинания',
    feats: 'Черты'
  },
  es: {
    books: 'Libros',
    weapons: 'Armas',
    backgrounds: 'Trasfondos',
    classes: 'Classes',
    subclasses: 'Subclasses',
    items: 'Objetos',
    armor: 'Armadura',
    shields: 'Shields',
    consumables: 'Consumables',
    spells: 'Hechizos',
    feats: 'Proezas'
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
            'books', 'backgrounds', 'classes', 'subclasses', 'weapons', 'armor', 'items', 'shields', 'consumables',
            'feats', 'spells'
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
            books: Pathfinder2Books, weapons: Pathfinder2Weapons, backgrounds: Pathfinder2Backgrounds, armor: Pathfinder2Armors,
            items: Pathfinder2Items, shields: Pathfinder2Shields, consumables: Pathfinder2Consumables, feats: Pathfinder2Feats,
            classes: Pathfinder2Classes, subclasses: Pathfinder2Subclasses, spells: Pathfinder2Spells
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
