import { For } from 'solid-js';

import { SharedContent } from '../../../pages';
import {
  fetchTransformationRequest, removeTransformationRequest, copyTransformationRequest
} from '../../../requests_v2/daggerheart/transformations';

export const DaggerheartTransformationsV2 = () => {
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
      onShowRequest={fetchTransformationRequest}
      onRemoveRequest={removeTransformationRequest}
      onCopyRequest={copyTransformationRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
