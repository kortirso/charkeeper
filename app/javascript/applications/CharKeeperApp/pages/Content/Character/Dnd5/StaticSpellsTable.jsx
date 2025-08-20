import { For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

export const StaticSpellsTable = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const renderStaticSpellDescription = (spell) => {
    const result = [];
    if (spell.data.limit) result.push(`${spell.data.limit} ${t('character.staticSpellPerDay')}`);
    if (spell.data.level) result.push(`${t('character.staticSpellLevel')} ${spell.data.level}`);
    if (spell.data.attack_bonus) result.push(`${t('character.staticSpellAttackBonus')} ${modifier(spell.data.attack_bonus)}`);
    if (spell.data.save_dc) result.push(`${t('character.staticSpellSaveDC')} ${spell.data.save_dc}`);

    return result.join(', ');
  }

  return (
    <div class="blockable mb-2 p-4">
      <table class="w-full table first-column-full-width">
        <tbody>
          <For each={props.spells}>
            {(spell) =>
              <tr>
                <td class="py-1 pl-1 dark:text-snow">
                  <p>
                    {spell.name}
                  </p>
                  <p class="text-xs">{renderStaticSpellDescription(spell)}</p>
                </td>
                <td />
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  );
}
