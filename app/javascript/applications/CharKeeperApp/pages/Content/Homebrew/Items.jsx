import { createSignal, createEffect, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartItemForm, DaggerheartItem } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewItemsRequest } from '../../../requests/fetchHomebrewItemsRequest';
import { createHomebrewItemRequest } from '../../../requests/createHomebrewItemRequest';
import { removeHomebrewItemRequest } from '../../../requests/removeHomebrewItemRequest';

export const HomebrewItems = (props) => {
  const [items, setItems] = createSignal(undefined);
  const [activeView, setActiveView] = createSignal('left');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchHomebrewItemsRequest(appState.accessToken, props.provider);

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        if (itemsData.errors) setItems([]);
        else setItems(itemsData.items);
      }
    );
  });

  const cancenCreatingItem = () => setActiveView('left');

  const createItem = async (payload) => {
    const result = await createHomebrewItemRequest(appState.accessToken, props.provider, payload);

    if (result.errors === undefined) {
      batch(() => {
        setItems(items().concat(result.item));
        setActiveView('left');
      });
    } else renderAlerts(result.errors);
  }

  const removeItem = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewItemRequest(appState.accessToken, props.provider, id);
    if (result.errors === undefined) {
      setItems(items().filter((item) => item.id !== id));
    } else renderAlerts(result.errors);
  }

  return (
    <>
      <ContentWrapper
        activeView={activeView()}
        leftView={
          <>
            <Button default classList="mb-2" onClick={() => setActiveView('right')}>
              {t(`pages.homebrewPage.${props.provider}.newItem`)}
            </Button>
            <Show when={items() !== undefined}>
              <For each={items()}>
                {(item) =>
                  <Toggle isOpen title={
                    <div class="flex items-center">
                      <p class="flex-1">{item.name[locale()]}</p>
                      <IconButton onClick={(e) => removeItem(e, item.id)}>
                        <Close />
                      </IconButton>
                    </div>
                  }>
                    <Switch>
                      <Match when={props.provider === 'daggerheart'}>
                        <DaggerheartItem item={item} homebrews={props.homebrews} />
                      </Match>
                    </Switch>
                  </Toggle>
                }
              </For>
            </Show>
          </>
        }
        rightView={
          <Show when={activeView() === 'right'}>
            <Switch>
              <Match when={props.provider === 'daggerheart'}>
                <NewDaggerheartItemForm homebrews={props.homebrews} onSave={createItem} onCancel={cancenCreatingItem} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
