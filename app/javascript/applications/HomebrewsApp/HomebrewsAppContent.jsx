import { For } from 'solid-js';

import { ContentPage } from './pages';
import { useAppState } from './context';

export const HomebrewsAppContent = () => {
  const [appState, { navigate }] = useAppState();

  return (
    <div class="mx-auto w-7xl">
      <div class="flex gap-x-4 my-4">
        <For each={[['dnd2024', 'D&D 2024'], ['daggerheart', 'Daggerheart'], ['pathfinder2', 'Pathfinder 2'], ['dc20', 'DC20']]}>
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
