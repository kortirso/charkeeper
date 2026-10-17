import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSpecialityRequest, removeSpecialityRequest } from '../../../requests_v2/pathfinder2/specialities';

export const Pathfinder2Classes = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Pathfinder2::Homebrews::Speciality');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Pathfinder2::Homebrews::Speciality', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Pathfinder2::Homebrews::Speciality', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Pathfinder2::Homebrews::Speciality', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
    </div>
  );

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Homebrew"
      publicationType="class"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSpecialityRequest}
      onRemoveRequest={removeSpecialityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
