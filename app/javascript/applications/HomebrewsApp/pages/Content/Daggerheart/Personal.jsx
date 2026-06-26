import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchCharactersRequest, fetchCharacterRequest } from '../../../requests_v2/daggerheart/characters';

export const DaggerheartPersonal = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchCharactersRequest(appState.accessToken);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <For each={props.info.features}>
        {(feature) =>
          <div>
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown mt-1"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <Show when={feature?.items}>
              <div class="pl-4 mt-2">
                <For each={feature?.items}>
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
      publicationType="character"
      onFetchRequest={fetchList}
      onShowRequest={fetchCharacterRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
