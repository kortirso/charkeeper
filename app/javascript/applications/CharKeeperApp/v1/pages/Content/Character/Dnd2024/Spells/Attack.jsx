import { Show } from 'solid-js';

import { Dice } from '../../../../../components';
import config from '../../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../../context';
import { modifier, localize } from '../../../../../helpers';

export const SpellAttack = (props) => {
  const [locale] = useAppLocale();

  const rollAttack = (event) => {
    event.stopPropagation();
    const damage = props.effects.find((item) => item.includes('damage,'))

    if (damage) {
      const values = damage.split(',');
      const damageDice = props.cantripsDamageDice ? values[values.length - 1].replace('1d', props.cantripsDamageDice) : values[values.length - 1];

      const dices = [];
      const parsedItem = damageDice.split('d');
      for (var i = 0; i < parsedItem[0]; i++) {
        dices.push(`D${parsedItem[1]}`)
      }

      props.openD20Attack(`/check attack "${props.title}"`, props.title, props.alterHit ? props.alterHit : props.character.spell_classes[props.activeSpellClass].attack_bonus, dices, 0);
    } else {
      props.openD20Test(`/check attack "${props.title}"`, props.title, props.alterHit ? props.alterHit : props.character.spell_classes[props.activeSpellClass].attack_bonus);
    }
  }

  return (
    <p class="spell-attribute">
      <Show when={props.hit && (props.character.spell_classes[props.activeSpellClass] || props.alterHit)}>
        <Show
          when={props.withDice}
          fallback={
            modifier(props.alterHit ? props.alterHit : props.character.spell_classes[props.activeSpellClass].attack_bonus)
          }
        >
          <div class="inline-block m-auto">
            <Dice
              width="32"
              height="32"
              text={
                modifier(props.alterHit ? props.alterHit : props.character.spell_classes[props.activeSpellClass].attack_bonus)
              }
              onClick={rollAttack}
            />
          </div>
        </Show>
      </Show>
      <Show when={props.dc && (props.character.spell_classes[props.activeSpellClass] || props.alterDc)}>
        {localize(config.abilities[props.dc].shortName, locale()).toUpperCase()} {props.alterDc ? props.alterDc : props.character.spell_classes[props.activeSpellClass].save_dc}
      </Show>
    </p>
  );
}

