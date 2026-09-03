import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSettingRequest, removeSettingRequest } from '../../../requests_v2/cosmere/settings';

export const CosmereSettings = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Cosmere::Homebrews::Setting');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Cosmere::Homebrews::Setting', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Cosmere::Homebrews::Setting', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
    </div>
  );

  return (
    <SharedContent
      provider="cosmere"
      parentType="Homebrew"
      publicationType="setting"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSettingRequest}
      onRemoveRequest={removeSettingRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
