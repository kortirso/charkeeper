import { Show, For } from 'solid-js';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/daggerheart/items';

export const DaggerheartUpgrades = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'upgrade');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'daggerheart', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <Show when={props.info.info.feature}>
        <For each={Object.values(props.info.info.feature)}>
          {(feature) =>
            <p>{feature}</p>
          }
        </For>
      </Show>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Item"
      publicationType="item"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
