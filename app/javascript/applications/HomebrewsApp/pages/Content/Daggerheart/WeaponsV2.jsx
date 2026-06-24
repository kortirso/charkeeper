import { SharedWeapon } from './SharedWeapon';

import { useAppState } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/daggerheart/items';

export const DaggerheartWeaponsV2 = () => {
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'primary weapon,secondary weapon');

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Daggerheart::Item"
      publicationType="weapon"
      onFetchRequest={fetchList}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={SharedWeapon}
    />
  );
}
