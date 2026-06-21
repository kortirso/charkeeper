import { For } from 'solid-js';

import { SharedContent } from '../../../pages';
import { fetchAncestryRequest, removeAncestryRequest, copyAncestryRequest } from '../../../requests_v2/daggerheart/ancestries';

export const DaggerheartAncestriesV2 = () => {
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
      parentType="Daggerheart::Homebrews::Ancestry"
      publicationType="ancestry"
      onShowRequest={fetchAncestryRequest}
      onRemoveRequest={removeAncestryRequest}
      onCopyRequest={copyAncestryRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
