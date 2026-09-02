import { For, Switch, Match } from 'solid-js';

import {
  Dnd2024Feats, Dnd2024Backgrounds, Dnd2024Books, Dnd2024Spells, Dnd2024Races, Dnd2024Subclasses, Dnd2024Weapons,
  Dnd2024Armors, Dnd2024Shields, Dnd2024Items, Dnd2024Consumables
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    items: 'Items',
    weapons: 'Weapons',
    subclasses: 'Subclasses',
    spells: 'Spells',
    feats: 'Feats',
    backgrounds: 'Backgrounds',
    races: 'Species',
    armor: 'Armor',
    shields: 'Shields',
    consumables: 'Consumables'
  },
  ru: {
    books: 'Книги',
    items: 'Предметы',
    weapons: 'Оружие',
    subclasses: 'Подклассы',
    spells: 'Заклинания',
    feats: 'Черты',
    backgrounds: 'Происхождения',
    races: 'Виды',
    armor: 'Броня',
    shields: 'Щиты',
    consumables: 'Расходники'
  },
  es: {
    books: 'Libros',
    items: 'Objetos',
    weapons: 'Armas',
    subclasses: 'Subclases',
    spells: 'Hechizos',
    feats: 'Proezas',
    backgrounds: 'Trasfondos',
    races: 'Species',
    armor: 'Armadura',
    shields: 'Shields',
    consumables: 'Consumables'
  }
}

export const Dnd2024 = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={
          [
            'books', 'races', 'subclasses', 'backgrounds', 'feats', 'spells', 'weapons', 'armor', 'items', 'consumables',
            'shields'
          ]
        }>
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
            feats: Dnd2024Feats, backgrounds: Dnd2024Backgrounds, books: Dnd2024Books, spells: Dnd2024Spells,
            races: Dnd2024Races, subclasses: Dnd2024Subclasses, weapons: Dnd2024Weapons, armor: Dnd2024Armors,
            items: Dnd2024Shields, consumables: Dnd2024Items, shields: Dnd2024Consumables
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
