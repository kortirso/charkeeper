import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSubraceRequest, removeSubraceRequest } from '../../../requests_v2/pathfinder2/subraces';

export const Pathfinder2Subraces = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subrace');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subrace', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subrace', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Pathfinder2::Homebrews::Subrace', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
    </div>
  );

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Homebrew"
      publicationType="subrace"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSubraceRequest}
      onRemoveRequest={removeSubraceRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
