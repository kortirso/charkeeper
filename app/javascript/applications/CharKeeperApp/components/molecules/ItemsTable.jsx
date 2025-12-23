import { createSignal, For, Show } from 'solid-js';

import { Button, IconButton } from '../../components';
import { useAppLocale } from '../../context';
import { Hands, Equipment, Backpack, Storage, Dots, Edit } from '../../assets';
import { clickOutside } from '../../helpers';

const STATE_ICONS = { 'hands': Hands, 'equipment': Equipment, 'backpack': Backpack, 'storage': Storage }

const TRANSLATION = {
  en: {
    delete: 'Remove',
    info: 'Info',
    quantity: 'Qty'
  },
  ru: {
    delete: 'Убрать',
    info: 'Информация',
    quantity: 'Кол-во'
  }
}

export const ItemsTable = (props) => {
  const items = () => props.items;
  const IconComponent = STATE_ICONS[props.state]; // eslint-disable-line solid/reactivity

  const [isOpen, setIsOpen] = createSignal(null);

  const [locale] = useAppLocale();

  const toggleMenu = (item) => setIsOpen(isOpen() ? null : item);

  return (
    <div class="blockable p-4 mb-2">
      <h2 class="text-lg mb-2 flex items-center gap-x-2">
        <IconComponent width={20} height={20} />
        {props.title}
      </h2>
      <p class="text-sm mb-2">{props.subtitle}</p>
      <Show when={items().length > 0}>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-center text-nowrap px-2">{TRANSLATION[locale()].quantity}</td>
              <td />
            </tr>
          </thead>
          <tbody>
            <For each={items()}>
              {(item) =>
                <tr>
                  <td class="py-1 pl-1">
                    <p>{item.name}</p>
                    <Show when={item.notes}>
                      <p class="text-sm mt-1 text-stone-800 dark:text-stone-300">{item.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1">
                    <p class="p-1 text-center">{item.states[props.state]}</p>
                  </td>
                  <td>
                    <div class="flex items-center gap-x-2">
                      <Button default size="small" onClick={() => props.onChangeItem(item)}>
                        <Edit width={16} height={16} />
                      </Button>
                      <div class="relative h-6" use:clickOutside={() => setIsOpen(false)}>
                        <IconButton onClick={() => toggleMenu(item)}>
                          <Dots />
                        </IconButton>
                        <Show when={isOpen() === item}>
                          <div class="absolute z-9 right-0 border border-gray-200 rounded overflow-hidden">
                            <Show when={item.has_description}>
                              <p class="dots-item" onClick={() => props.onInfoItem(item.item_id, item.name)}>{TRANSLATION[locale()].info}</p>
                            </Show>
                            <p class="dots-item" onClick={() => props.onRemoveCharacterItem(item)}>{TRANSLATION[locale()].delete}</p>
                          </div>
                        </Show>
                      </div>
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
