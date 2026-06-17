import { For } from 'solid-js';

import { SharedContent } from '../../../pages';
import { fetchCommunityRequest, removeCommunityRequest, copyCommunityRequest } from '../../../requests_v2/daggerheart/communities';

export const DaggerheartCommunitiesV2 = () => {
  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
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
      parentType="Daggerheart::Homebrews::Community"
      publicationType="community"
      onShowRequest={fetchCommunityRequest}
      onRemoveRequest={removeCommunityRequest}
      onCopyRequest={copyCommunityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
