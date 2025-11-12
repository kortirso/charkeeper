import { ContentPage } from './pages';
import { useAppState } from './context';

export const HomebrewsAppContent = () => {
  const [appState, { navigate }] = useAppState();

  return (
    <div class="mx-auto w-7xl">
      <div class="flex gap-x-4 my-4">
        <p
          class="homebrew-provider-nav"
          classList={{ 'active': appState.activePage === 'dnd5' }}
          onClick={() => navigate('dnd5', {})}
        >D&D 5</p>
        <p
          class="homebrew-provider-nav"
          classList={{ 'active': appState.activePage === 'dnd2024' }}
          onClick={() => navigate('dnd2024', {})}
        >D&D 2024</p>
        <p
          class="homebrew-provider-nav"
          classList={{ 'active': appState.activePage === 'daggerheart' }}
          onClick={() => navigate('daggerheart', {})}
        >Daggerheart</p>
        <p
          class="homebrew-provider-nav"
          classList={{ 'active': appState.activePage === 'pathfinder2' }}
          onClick={() => navigate('pathfinder2', {})}
        >Pathfinder 2</p>
        <p
          class="homebrew-provider-nav"
          classList={{ 'active': appState.activePage === 'dc20' }}
          onClick={() => navigate('dc20', {})}
        >DC20</p>
      </div>
      <ContentPage />
    </div>
  );
}
