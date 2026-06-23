import { For } from 'solid-js';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest } from '../../../requests_v2/list';
import {
  fetchTransformationRequest, removeTransformationRequest, copyTransformationRequest
} from '../../../requests_v2/daggerheart/transformations';

export const DaggerheartTransformationsV2 = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Transformation');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <For each={props.info.features}>
        {(feature) =>
          <div>
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown mt-1"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Daggerheart::Homebrews::Transformation"
      publicationType="transformation"
      onFetchRequest={fetchList}
      onShowRequest={fetchTransformationRequest}
      onRemoveRequest={removeTransformationRequest}
      onCopyRequest={copyTransformationRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
