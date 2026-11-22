import { ContentLayout } from './layouts';
import { useAppState } from './context';

export const Content = () => {
  const [appState] = useAppState();

  return (
    <div class="ck-v2" data-color-mode={appState.colorSchema} data-color-scheme={appState.colorTheme}>
      <ContentLayout />
    </div>
  );
}
