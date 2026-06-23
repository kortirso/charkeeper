import { For } from 'solid-js';

import { ContentPage } from './pages';
import { useAppState } from './context';

export const HomebrewsAppContent = () => {
  const [appState, { navigate }] = useAppState();

  return (
    <div class="mx-auto w-7xl">
      <div class="flex gap-x-4 my-4">
        <For each={[['daggerheart', 'Daggerheart']]}>
          {(item) =>
            <p
              class="homebrew-provider-nav"
              classList={{ 'active': appState.activePage === item[0] }}
              onClick={() => navigate(item[0], {})}
            >{item[1]}</p>
          }
        </For>
      </div>
      <ContentPage />
    </div>
  );
}
