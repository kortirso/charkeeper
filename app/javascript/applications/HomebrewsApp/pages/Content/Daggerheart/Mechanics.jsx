import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchMechanicRequest, removeMechanicRequest } from '../../../requests_v2/daggerheart/mechanics';

export const DaggerheartMechanics = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Mechanic');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Daggerheart::Homebrews::Mechanic', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Mechanic', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <For each={[1, 2, 3, 4]}>
        {(tier) =>
          <Show when={props.info.items.filter((item) => item.tier === tier).length > 0}>
            <div class="pt-4 border-t border-gray-500">
              <p class="mb-4 font-medium!">Tier {tier}</p>
              <div class="pl-4 flex flex-col gap-2">
                <For each={props.info.items.filter((item) => item.tier === tier)}>
                  {(item) =>
                    <div class="flex flex-col gap-1">
                      <p class="font-medium!">{item.title}</p>
                      <p
                        class="feat-markdown"
                        innerHTML={item.description} // eslint-disable-line solid/no-innerhtml
                      />
                      <div class="pl-4 flex flex-col gap-2">
                        <For each={item.features}>
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
                                    {(featureItem) =>
                                      <SharedWeapon info={featureItem} />
                                    }
                                  </For>
                                </div>
                              </Show>
                            </div>
                          }
                        </For>
                      </div>
                    </div>
                  }
                </For>
              </div>
            </div>
          </Show>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      publicationType="mechanic"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchMechanicRequest}
      onRemoveRequest={removeMechanicRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
