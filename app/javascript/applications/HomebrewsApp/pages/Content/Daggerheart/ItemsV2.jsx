import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchItemsRequest } from '../../../requests_v2/items';
import { fetchItemRequest, removeItemRequest, copyItemRequest } from '../../../requests_v2/daggerheart/items';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    kind: 'Kind',
    kinds: {
      'item': 'Item',
      'recipe': 'Recipe'
    }
  },
  ru: {
    kind: 'Тип',
    kinds: {
      'item': 'Предмет',
      'recipe': 'Рецепт'
    }
  },
  es: {
    kind: 'Tipo',
    kinds: {
      'item': 'Item',
      'recipe': 'Recipe'
    }
  }
}

export const DaggerheartItemsV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchItemsRequest(appState.accessToken, 'daggerheart', 'item,recipe');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>{localize(TRANSLATION, locale()).kind} - {localize(TRANSLATION, locale()).kinds[props.info.kind]}</p>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="item"
      publicationType="item"
      onFetchRequest={fetchList}
      onShowRequest={fetchItemRequest}
      onRemoveRequest={removeItemRequest}
      onCopyRequest={copyItemRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
