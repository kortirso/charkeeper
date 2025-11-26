import { For, Switch, Match } from 'solid-js';

import {
  DaggerheartAncestries, DaggerheartCommunities, DaggerheartClasses, DaggerheartSubclasses, DaggerheartItems,
  DaggerheartWeapons, DaggerheartArmor, DaggerheartDomains, DaggerheartTransformations, DaggerheartBooks
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    books: 'Books',
    ancestries: 'Ancestries',
    communities: 'Communities',
    classes: 'Classes',
    subclasses: 'Subclasses',
    items: 'Items',
    weapons: 'Weapons',
    armor: 'Armor',
    domains: 'Domains',
    transformations: 'Transformations'
  },
  ru: {
    books: 'Книги',
    ancestries: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    subclasses: 'Подклассы',
    items: 'Предметы',
    weapons: 'Оружие',
    armor: 'Броня',
    domains: 'Домены',
    transformations: 'Трансформации'
  }
}

export const Daggerheart = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={['books', 'ancestries', 'communities', 'classes', 'subclasses', 'items', 'weapons', 'armor', 'domains', 'transformations']}>
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
            ancestries: DaggerheartAncestries, communities: DaggerheartCommunities, classes: DaggerheartClasses,
            subclasses: DaggerheartSubclasses, items: DaggerheartItems, weapons: DaggerheartWeapons,
            armor: DaggerheartArmor, domains: DaggerheartDomains, transformations: DaggerheartTransformations,
            books: DaggerheartBooks
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
