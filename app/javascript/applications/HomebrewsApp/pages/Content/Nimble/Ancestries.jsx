import { For } from 'solid-js';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchAncestryRequest, removeAncestryRequest } from '../../../requests_v2/nimble/ancestries';

export const NimbleAncestries = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Nimble::Homebrews::Ancestry');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Nimble::Homebrews::Ancestry', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Nimble::Homebrews::Ancestry', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <For each={props.info.features}>
        {(feature) =>
          <div class="flex flex-col gap-1">
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="nimble"
      parentType="Homebrew"
      publicationType="ancestry"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchAncestryRequest}
      onRemoveRequest={removeAncestryRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
