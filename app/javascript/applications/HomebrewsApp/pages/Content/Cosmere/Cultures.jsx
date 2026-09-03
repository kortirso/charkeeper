import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchCultureRequest, removeCultureRequest } from '../../../requests_v2/cosmere/cultures';

export const CosmereCultures = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Cosmere::Homebrews::Culture');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Cosmere::Homebrews::Culture', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Cosmere::Homebrews::Culture', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <p>Settings - {props.info.only.join(', ')}</p>
    </div>
  );

  return (
    <SharedContent
      provider="cosmere"
      parentType="Homebrew"
      publicationType="culture"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchCultureRequest}
      onRemoveRequest={removeCultureRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
