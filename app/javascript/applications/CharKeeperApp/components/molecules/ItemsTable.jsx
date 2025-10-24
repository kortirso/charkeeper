import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button } from '../../components';
import { useAppLocale } from '../../context';
import { Close, Hands, Equipment, Backpack, Storage } from '../../assets';

const STATE_ICONS = { 'hands': Hands, 'equipment': Equipment, 'backpack': Backpack, 'storage': Storage }

export const ItemsTable = (props) => {
  const items = () => props.items;
  const IconComponent = STATE_ICONS[props.state];

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div class="blockable p-4 mb-2">
      <h2 class="text-lg dark:text-snow mb-2 flex items-center gap-x-2">
        <IconComponent width={20} height={20} />
        {props.title}
      </h2>
      <p class="text-sm dark:text-snow mb-2">{props.subtitle}</p>
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
                    <div class="flex items-center gap-x-2">
                      <For each={[
                        { state: 'hands', flag: true, Icon: Hands },
                        { state: 'equipment', flag: true, Icon: Equipment },
                        { state: 'backpack', flag: false, Icon: Backpack },
                        { state: 'storage', flag: false, Icon: Storage }
                      ]}>
                        {({ state, flag, Icon }) =>
                          <Show when={props.state !== state}>
                            <Button default size="small" onClick={() => props.onUpdateCharacterItem(item, { character_item: { ready_to_use: flag, state: state } })}>
                              <Icon width={16} height={16} />
                            </Button>
                          </Show>
                        }
                      </For>
                      <Button default size="small" onClick={() => props.onRemoveCharacterItem(item)}>
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
