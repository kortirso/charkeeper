import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchRaceRequest, removeRaceRequest } from '../../../requests_v2/dnd2024/races';

export const Dnd2024Races = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Dnd2024::Homebrews::Race');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Dnd2024::Homebrews::Race', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Dnd2024::Homebrews::Race', ids);

  const ChildrenComponent = () => (
    <div class="flex flex-col gap-2" />
  );

  return (
    <SharedContent
      provider="dnd2024"
      parentType="Homebrew"
      publicationType="race"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchRaceRequest}
      onRemoveRequest={removeRaceRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
