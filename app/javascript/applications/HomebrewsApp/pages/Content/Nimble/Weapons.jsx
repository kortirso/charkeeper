import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/nimble/items';

export const NimbleWeapons = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'nimble', 'weapon');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'nimble', ids);

  return (
    <SharedContent
      provider="nimble"
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
