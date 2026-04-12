import { createSignal, Show } from 'solid-js';

import { Input, Button, StatsBlock } from '../../../../../components';
import { useAppLocale } from '../../../../../context';
import { Minus, Plus } from '../../../../../assets';
import { localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    current: 'Health',
    max: 'Max health',
    temp: 'Temp health',
    damage: 'Damage',
    heal: 'Heal'
  },
  ru: {
    current: 'Хиты',
    max: 'Макс хиты',
    temp: 'Врем хиты',
    damage: 'Урон',
    heal: 'Лечение'
  },
  es: {
    current: 'Salud',
    max: 'Salud máxima',
    temp: 'Salud temporal',
    damage: 'Daño',
    heal: 'Curación'
  }
}

export const Pathfinder2SharedHealth = (props) => {
  const [damageHealValue, setDamageHealValue] = createSignal(0);

  const [locale] = useAppLocale();

  return (
    <StatsBlock
      items={[
        { title: localize(TRANSLATION, locale()).current, value: props.currentHealth },
        { title: localize(TRANSLATION, locale()).max, value: props.maxHealth },
        {
          title: localize(TRANSLATION, locale()).temp,
          value:
            <div class="flex items-center gap-4">
              <Button default size="small" disabled={props.tempHealth === 0} onClick={() => props.tempHealth === 0 ? null : props.onChangeTempHealth(-1)}><Minus /></Button>
              {props.tempHealth}
              <Button default size="small" onClick={() => props.onChangeTempHealth(1)} ><Plus /></Button>
            </div>
        }
      ]}
    >
      <div class="flex items-center pt-0 p-4">
        <Button default textable classList="flex-1" onClick={() => props.onChangeHealth(-1, damageHealValue())}>
          {localize(TRANSLATION, locale()).damage}
        </Button>
        <Input numeric containerClassList="w-20 mx-4" value={damageHealValue()} onInput={setDamageHealValue} />
        <Button default textable classList="flex-1" onClick={() => props.onChangeHealth(1, damageHealValue())}>
          {localize(TRANSLATION, locale()).heal}
        </Button>
      </div>
      <Show when={props.children}>{props.children}</Show>
    </StatsBlock>
  );
}
