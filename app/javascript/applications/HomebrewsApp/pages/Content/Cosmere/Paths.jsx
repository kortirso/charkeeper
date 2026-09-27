import { For } from 'solid-js';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchPathRequest, removePathRequest } from '../../../requests_v2/cosmere/paths';

export const CosmerePaths = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Cosmere::Homebrews::Path');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Cosmere::Homebrews::Path', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Cosmere::Homebrews::Path', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Cosmere::Homebrews::Path', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <p>Settings - {props.info.only.join(', ')}</p>
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
      provider="cosmere"
      parentType="Homebrew"
      publicationType="path"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchPathRequest}
      onRemoveRequest={removePathRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
