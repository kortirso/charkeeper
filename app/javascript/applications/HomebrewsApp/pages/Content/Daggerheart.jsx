import { For, Switch, Match } from 'solid-js';

import {
  DaggerheartAncestriesV2, DaggerheartCommunitiesV2, DaggerheartSpecialities, DaggerheartSubclasses, DaggerheartDomainsV2,
  DaggerheartTransformationsV2, DaggerheartBooksV2, DaggerheartItemsV2, DaggerheartConsumables,
  DaggerheartWeaponsV2, DaggerheartArmorV2
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    ancestries: 'Ancestries',
    communities: 'Communities',
    classes: 'Classes',
    subclasses: 'Subclasses',
    domains: 'Domains',
    transformations: 'Transformations',
    items: 'Items',
    consumables: 'Consumables',
    weapons: 'Weapons',
    armor: 'Armor',
    recipes: 'Recipes',
    features: 'Features'
  },
  ru: {
    books: 'Книги',
    ancestries: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    subclasses: 'Подклассы',
    domains: 'Домены',
    transformations: 'Трансформации',
    items: 'Предметы',
    consumables: 'Consumables',
    weapons: 'Оружие',
    armor: 'Броня',
    recipes: 'Рецепты',
    features: 'Способности'
  },
  es: {
    books: 'Libros',
    ancestries: 'Ancestrías',
    communities: 'Comunidades',
    classes: 'Clases',
    subclasses: 'Subclases',
    domains: 'Dominios',
    transformations: 'Transformaciones',
    items: 'Objetos',
    consumables: 'Consumables',
    weapons: 'Armas',
    armor: 'Armadura',
    recipes: 'Recetas',
    features: 'Características'
  }
}

export const Daggerheart = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex flex-wrap gap-x-4 gap-y-2 my-4">
        <For each={
          ['books', 'ancestries', 'communities', 'classes', 'subclasses', 'domains', 'transformations', 'items', 'consumables', 'weapons', 'armor']
        }>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePageParams.tab === item }}
              onClick={() => navigate('daggerheart', { tab: item })}
            >{TRANSLATION[locale()][item]}</p>
          }
        </For>
      </div>
      <Switch fallback={<></>}>
        <For each={
          Object.entries({
            ancestries: DaggerheartAncestriesV2, communities: DaggerheartCommunitiesV2, classes: DaggerheartSpecialities,
            subclasses: DaggerheartSubclasses, domains: DaggerheartDomainsV2, transformations: DaggerheartTransformationsV2,
            books: DaggerheartBooksV2, items: DaggerheartItemsV2, weapons: DaggerheartWeaponsV2,
            consumables: DaggerheartConsumables, armor: DaggerheartArmorV2
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
