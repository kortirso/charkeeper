import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSubclassRequest, removeSubclassRequest } from '../../../requests_v2/pathfinder2/subclasses';

export const Pathfinder2Subclasses = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subclass');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subclass', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subclass', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subclass', ids);

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Homebrew"
      publicationType="subclass"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSubclassRequest}
      onRemoveRequest={removeSubclassRequest}
    />
  );
}
