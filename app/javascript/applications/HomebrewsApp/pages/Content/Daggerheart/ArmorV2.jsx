import { Show } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest } from '../../../requests_v2/items';
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

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>{localize(TRANSLATION, locale()).tier} - {props.info.info.tier}</p>
      <p>{localize(TRANSLATION, locale()).baseScore} - {props.info.info.base_score}</p>
      <p>{localize(TRANSLATION, locale()).thresholds} - {props.info.info.bonuses.thresholds.major}/{props.info.info.bonuses.thresholds.severe}</p>
      <Show when={props.info.info.features[0] && localize(props.info.info.features[0], locale())}>{localize(props.info.info.features[0], locale())}</Show>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="armor"
      publicationType="armor"
      onFetchRequest={fetchList}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
