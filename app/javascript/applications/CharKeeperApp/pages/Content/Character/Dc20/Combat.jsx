import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Dice, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

export const Dc20Combat = (props) => {
  const character = () => props.character;

  const [, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 blockable mb-2">
        <h2 class="text-lg font-normal! mb-2 dark:text-snow">{title}</h2>
        <table class="w-full table first-column-full-width table-top">
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
                    <Show when={attack.features_text.length > 0}>
                      <For each={attack.features_text}>
                        {(feature) =>
                          <p class="mt-1 dark:text-snow text-xs">{feature}</p>
                        }
                      </For>
                    </Show>
                    <Show when={attack.notes}>
                      <p class="text-xs mt-1">{attack.notes}</p>
                    </Show>
                  </td>
                  <td class="py-1 text-center">
                    <Dice
                      width="28"
                      height="28"
                      text={modifier(attack.attack_bonus)}
                      onClick={() => props.openDiceRoll(`/check attack ${attack.name}`, attack.attack_bonus)}
                    />
                  </td>
                  <td class="py-1 text-center">
                    <p>{attack.damage} {attack.damage_types.map((item) => item.toUpperCase()).join('/')}</p>
                  </td>
                  <td class="py-1 text-center"><p>{attack.distance}</p></td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Combat' }}>
      <GuideWrapper character={character()}>
        {renderAttacksBox(t('combat.list.equipment'), character().attacks.filter((item) => item.ready_to_use))}
        {renderAttacksBox(t('combat.list.backpack'), character().attacks.filter((item) => !item.ready_to_use))}
      </GuideWrapper>
    </ErrorWrapper>
  );
}
