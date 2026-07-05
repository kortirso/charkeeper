import { For } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/daggerheart/items';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    health_marked: 'Health',
    stress_marked: 'Stress',
    hope_marked: 'Hope'
  },
  ru: {
    health_marked: 'Раны',
    stress_marked: 'Стресс',
    hope_marked: 'Надежда'
  },
  es: {
    health_marked: 'Health',
    stress_marked: 'Stress',
    hope_marked: 'Hope'
  }
}

export const DaggerheartConsumables = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'consumables');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'daggerheart', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <For each={props.info.info.consume}>
        {(consume) =>
          <div>
            <p>{localize(TRANSLATION, locale())[consume.attribute]}</p>
            <p>{consume.formula}</p>
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Item"
      publicationType="consumables"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
