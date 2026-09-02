import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/dnd2024/items';

export const Dnd2024Consumables = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'dnd2024', 'potion');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'dnd2024', ids);

  return (
    <SharedContent
      provider="dnd2024"
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
