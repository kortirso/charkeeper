import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/cosmere/items';

export const CosmereArmors = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'cosmere', 'armor');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'cosmere', ids);

  return (
    <SharedContent
      provider="cosmere"
      parentType="Item"
      publicationType="armor"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
    />
  );
}
