import { Show } from 'solid-js';

import { Dice } from '../../../../../components';
import config from '../../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../../context';
import { modifier } from '../../../../../helpers';

export const SpellAttack = (props) => {
  const [locale] = useAppLocale();

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
              onClick={(event) => { event.stopPropagation(); props.openDiceRoll('/check attack spell', props.alterHit ? props.alterHit : props.character.spell_classes[props.activeSpellClass].attack_bonus, props.title) }}
            />
          </div>
        </Show>
      </Show>
      <Show when={props.dc && (props.character.spell_classes[props.activeSpellClass] || props.alterDc)}>
        {config.abilities[props.dc].shortName[locale()].toUpperCase()} {props.alterDc ? props.alterDc : props.character.spell_classes[props.activeSpellClass].save_dc}
      </Show>
    </p>
  );
}

