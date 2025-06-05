import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';
import { PlusSmall } from '../../../../assets';

export const DaggerheartItems = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderItems = (title, items) => (
    <Toggle title={title}>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td />
            <td />
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(item) =>
              <tr>
                <td class="py-1">
                  <p class="font-cascadia-light">{item.name}</p>
                </td>
                <td>
                  <Button default size="small" onClick={() => props.onBuyItem(item)}>
                    <PlusSmall />
                  </Button>
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
      {renderItems(t('character.primaryWeapon'), props.items.filter((item) => item.kind.includes('primary weapon')))}
      {renderItems(t('character.secondaryWeapon'), props.items.filter((item) => item.kind.includes('secondary weapon')))}
      {renderItems(t('character.armorList'), props.items.filter((item) => item.kind.includes('armor')))}
      <Button default textable onClick={props.onNavigatoToEquipment}>{t('back')}</Button>
    </Show>
  );
}
