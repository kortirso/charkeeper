import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchAncestryRequest, removeAncestryRequest } from '../../../requests_v2/daggerheart/ancestries';

export const DaggerheartAncestriesV2 = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Ancestry');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Daggerheart::Homebrews::Ancestry', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Ancestry', ids);

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
