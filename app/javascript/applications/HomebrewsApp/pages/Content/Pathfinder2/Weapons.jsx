import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/pathfinder2/items';

export const Pathfinder2Weapons = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'pathfinder2', 'weapon');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'pathfinder2', ids);

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Item"
      publicationType="weapon"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
    />
  );
}
