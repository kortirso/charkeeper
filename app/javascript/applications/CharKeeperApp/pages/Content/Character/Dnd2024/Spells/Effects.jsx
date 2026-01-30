import { Show, For } from 'solid-js';

import { Heal, Damage, Buff, Debuff } from '../../../../../assets';

const TYPES = { 'heal': Heal, 'buff': Buff, 'debuff': Debuff };
const DIRECT_VALUES = ['heal', 'buff', 'debuff'];

export const SpellEffects = (props) => {
  const renderValue = (value) => {
    if (DIRECT_VALUES.includes(value)) {
      const Component = TYPES[value];

      return <span><Component width="20" height="20" /></span>;
    } else {
      const values = value.split(',');
      const damage = props.cantripsDamageDice ? values[values.length - 1].replace('1d', props.cantripsDamageDice) : values[values.length - 1];

      return <span class="flex items-center gap-x-1"><Damage width="20" height="20" /> {damage}</span>;
    }
  }

  return (
    <p class="spell-attribute gap-2">
      <Show when={props.value}>
        <For each={props.value}>
          {(value) => renderValue(value)}
        </For>
      </Show>
    </p>
  );
}
