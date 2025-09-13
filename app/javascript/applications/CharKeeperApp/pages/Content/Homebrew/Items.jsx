import { createSignal, createEffect, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { NewDaggerheartItemForm, DaggerheartItem } from '../../../pages';
import { ContentWrapper, Button, IconButton, Toggle, Input } from '../../../components';
import { Close } from '../../../assets';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewItemsRequest } from '../../../requests/fetchHomebrewItemsRequest';
import { createHomebrewItemRequest } from '../../../requests/createHomebrewItemRequest';
import { removeHomebrewItemRequest } from '../../../requests/removeHomebrewItemRequest';
import { copyHomebrewItemRequest } from '../../../requests/copyHomebrewItemRequest';
import { copyToClipboard } from '../../../helpers';

export const HomebrewItems = (props) => {
  const [items, setItems] = createSignal(undefined);
  const [activeView, setActiveView] = createSignal('left');
  const [copyItemId, setCopyItemId] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlert, renderAlerts, renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchItems = async () => await fetchHomebrewItemsRequest(appState.accessToken, props.provider);

  createEffect(() => {
    if (items() !== undefined) return;

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        if (itemsData.errors) setItems([]);
        else setItems(itemsData.items);
      }
    );
  });

  const cancelCreatingItem = () => setActiveView('left');

  const createItem = async (payload) => {
    const result = await createHomebrewItemRequest(appState.accessToken, props.provider, payload);

    if (result.errors_list === undefined) {
      batch(() => {
        setItems(items().concat(result.item));
        setActiveView('left');
      });
    } else renderAlerts(result.errors_list);
  }

  const removeItem = async (event, id) => {
    event.stopPropagation();

    const result = await removeHomebrewItemRequest(appState.accessToken, props.provider, id);
    if (result.errors_list === undefined) {
      setItems(items().filter((item) => item.id !== id));
    } else renderAlerts(result.errors_list);
  }

  const copyItem = async () => {
    const result = await copyHomebrewItemRequest(appState.accessToken, props.provider, copyItemId());

    if (result.errors_list === undefined) {
      const itemsData = await fetchItems();
      setItems(itemsData.items);
    } else renderAlert(result.errors_list);
    setCopyItemId('');
  }

  const copy = (value) => {
    copyToClipboard(value);
    renderNotice(t('alerts.copied'));
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
            <div class="flex mb-2">
              <Button default size="small" classList="px-2" onClick={copyItem}>
                {t('copy')}
              </Button>
              <Input
                containerClassList="ml-2 flex-1"
                placeholder={t(`pages.homebrewPage.${props.provider}.copyPlaceholder`)}
                value={copyItemId()}
                onInput={(value) => setCopyItemId(value)}
              />
            </div>
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
                    <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer" onClick={() => copy(item.id)}>
                      COPY
                    </p>
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
                <NewDaggerheartItemForm homebrews={props.homebrews} onSave={createItem} onCancel={cancelCreatingItem} />
              </Match>
            </Switch>
          </Show>
        }
      />
    </>
  );
}
