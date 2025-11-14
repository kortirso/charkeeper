import { For, Switch, Match } from 'solid-js';

import {
  DaggerheartAncestries, DaggerheartCommunities, DaggerheartClasses, DaggerheartSubclasses, DaggerheartItems,
  DaggerheartWeapons, DaggerheartArmor
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    ancestries: 'Ancestries',
    communities: 'Communities',
    classes: 'Classes',
    subclasses: 'Subclasses',
    items: 'Items',
    weapons: 'Weapons',
    armor: 'Armor'
  },
  ru: {
    ancestries: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    subclasses: 'Подклассы',
    items: 'Предметы',
    weapons: 'Оружие',
    armor: 'Броня'
  }
}

export const Daggerheart = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={['ancestries', 'communities']}>
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
            armor: DaggerheartArmor
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
