import { For } from 'solid-js';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSpecializationRequest, removeSpecializationRequest } from '../../../requests_v2/cosmere/specializations';

export const CosmereSpecializations = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Cosmere::Homebrews::Specialization');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Cosmere::Homebrews::Specialization', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Cosmere::Homebrews::Specialization', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Cosmere::Homebrews::Specialization', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <p>Settings - {props.info.only.join(', ')}</p>
      <p>Origin class - {props.info.origin_class}</p>
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
      publicationType="specialization"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSpecializationRequest}
      onRemoveRequest={removeSpecializationRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
