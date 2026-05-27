import { For, Switch, Match } from 'solid-js';

import {
  CosmereHeroicPaths
} from '../../pages';
import { useAppState, useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    heroics: 'Heroic Paths'
  },
  ru: {
    heroics: 'Героические пути'
  }
}

export const Cosmere = () => {
  const [appState, { navigate }] = useAppState();

  const [locale] = useAppLocale();

  return (
    <>
      <div class="flex gap-x-4 my-4">
        <For each={['heroics']}>
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
            heroics: CosmereHeroicPaths
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
