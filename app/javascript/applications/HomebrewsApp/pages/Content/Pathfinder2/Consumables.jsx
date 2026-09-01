import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/pathfinder2/items';

export const Pathfinder2Consumables = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'pathfinder2', 'consumables');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'pathfinder2', ids);

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Item"
      publicationType="consumables"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
    />
  );
}
