import { For, Show, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button } from '../../components';
import { useAppLocale } from '../../context';
import { Close, Arrow } from '../../assets';

export const ItemsTable = (props) => {
  const items = () => props.items;

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div class="blockable p-4 mb-2">
      <h2 class="text-lg dark:text-snow">{props.title}</h2>
      <Show when={items().length > 0}>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-center text-nowrap px-2">{t('equipment.quantity')}</td>
              <td />
            </tr>
          </thead>
          <tbody>
            <For each={items()}>
              {(item) =>
                <tr>
                  <td class="py-1 pl-1">
                    <p class="dark:text-snow">{item.name}</p>
                    <Show when={item.notes}>
                      <p class="text-sm mt-1 dark:text-snow">{item.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1">
                    <p
                      class="p-1 text-center cursor-pointer dark:text-snow"
                      onClick={() => props.onChangeItem(item)}
                    >{item.quantity}</p>
                  </td>
                  <td>
                    <div class="flex items-center">
                      <Switch>
                        <Match when={item.ready_to_use}>
                          <Button default size="small" onClick={() => props.onUpdateCharacterItem(item, { character_item: { ready_to_use: false } })}>
                            <Arrow bottom width={16} height={16} />
                          </Button>
                        </Match>
                        <Match when={!item.ready_to_use}>
                          <Button default size="small" onClick={() => props.onUpdateCharacterItem(item, { character_item: { ready_to_use: true } })}>
                            <Arrow top width={16} height={16} />
                          </Button>
                        </Match>
                      </Switch>
                      <Button default size="small" classList="ml-4" onClick={() => props.onRemoveCharacterItem(item)}>
                        <Close />
                      </Button>
                    </div>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}
