import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle } from '../../../../atoms';

import { useAppLocale } from '../../../../../context';

export const Dnd5Items = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderItems = (title, items) => (
    <Toggle title={title}>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <td class="text-center px-2">{t('equipment.weight')}</td>
            <td class="text-center text-nowrap px-2">{t('equipment.cost')}</td>
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p>{item.name}</p>
                </td>
                <td class="py-1 text-center">{item.data.weight}</td>
                <td class="py-1 text-center">{item.data.price / 100}</td>
                <td>
                  <p
                    class="btn btn-small"
                    onClick={() => props.onBuyItem(item)}
                  >+</p>
                </td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </Toggle>
  );

  return (
    <Show when={props.items !== undefined}>
      {renderItems(t('character.itemsList'), props.items.filter((item) => item.kind === 'item'))}
      {renderItems(t('character.weaponsList'), props.items.filter((item) => item.kind.includes('weapon')))}
      {renderItems(t('character.armorList'), props.items.filter((item) => item.kind.includes('armor') || item.kind.includes('shield')))}
    </Show>
  );
}
