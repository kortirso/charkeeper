import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, batchDestroyRequest } from '../../../requests_v2/list';
import {
  fetchTransformationRequest, removeTransformationRequest, copyTransformationRequest
} from '../../../requests_v2/daggerheart/transformations';

export const DaggerheartTransformationsV2 = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Transformation');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Transformation', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <For each={props.info.features}>
        {(feature) =>
          <div class="flex flex-col gap-1">
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <Show when={Object.keys(feature.modifiers).length > 0}>
              <FeatureModifiers items={feature.modifiers} />
            </Show>
            <Show when={feature.items}>
              <div class="pl-4">
                <For each={feature.items}>
                  {(item) =>
                    <SharedWeapon info={item} />
                  }
                </For>
              </div>
            </Show>
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Homebrew"
      publicationType="transformation"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchTransformationRequest}
      onRemoveRequest={removeTransformationRequest}
      onCopyRequest={copyTransformationRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
