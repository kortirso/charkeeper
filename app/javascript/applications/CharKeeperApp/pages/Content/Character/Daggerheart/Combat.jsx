import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

export const DaggerheartCombat = (props) => {
  const character = () => props.character;

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 blockable mb-2">
        <h2 class="text-lg font-normal! mb-2 dark:text-snow">{title}</h2>
        <table class="w-full table first-column-full-width">
          <thead>
            <tr>
              <td />
              <td class="text-center dark:text-snow">{t('combat.table.bonus')}</td>
              <td class="text-center dark:text-snow">{t('combat.table.damage')}</td>
              <td class="text-center dark:text-snow">{t('combat.table.distance')}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) =>
                <tr class="dark:text-snow">
                  <td class="py-1 pl-1">
                    <p>{attack.name}</p>
                    <Show when={attack.features.length > 0}>
                      <p class="text-xs">
                        {typeof variable === 'string' ? attack.features.join(', ') : attack.features.map((item) => item[locale()]).join(', ')}
                      </p>
                    </Show>
                    <Show when={attack.notes}>
                      <p class="text-xs">{attack.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
                  <td class="py-1 text-center">
                    <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                    <p class="text-xs">{attack.damage_type}</p>
                  </td>
                  <td class="py-1 text-center">
                    <p>{attack.range}</p>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartCombat' }}>
      {renderAttacksBox(t('combat.list.equipment'), character().attacks.filter((item) => item.ready_to_use))}
      {renderAttacksBox(t('combat.list.backpack'), character().attacks.filter((item) => !item.ready_to_use))}
    </ErrorWrapper>
  );
}
