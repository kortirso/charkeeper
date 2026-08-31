import { For, Show } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest, batchDestroyRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/daggerheart/items';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    tier: 'Tier',
    baseScore: 'Base score',
    thresholds: 'Damage thresholds'
  },
  ru: {
    tier: 'Ранг',
    baseScore: 'Очки доспеха',
    thresholds: 'Пороги урона'
  },
  es: {
    tier: 'Rango',
    baseScore: 'Puntuación de armadura',
    thresholds: 'Umbrales de daño'
  }
}

export const DaggerheartArmorV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'armor');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'daggerheart', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>{localize(TRANSLATION, locale()).tier} - {props.info.info.tier}</p>
      <p>{localize(TRANSLATION, locale()).baseScore} - {props.info.modifiers.armor_score}</p>
      <p>{localize(TRANSLATION, locale()).thresholds} - {props.info.modifiers['damage_thresholds.major']}/{props.info.modifiers['damage_thresholds.severe']}</p>
      <Show when={props.info.features && props.info.features.length > 0}>
        <For each={props.info.features}>
          {(feature) =>
            <p
              class="feat-markdown mt-1"
              innerHTML={feature} // eslint-disable-line solid/no-innerhtml
            />
          }
        </For>
      </Show>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Item"
      publicationType="armor"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
