import { createMemo, For, Show } from 'solid-js';

import { StatsBlock, Dice } from '../../../../../components';
import { useAppLocale } from '../../../../../context';
import { modifier, localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    armorClass: 'Armor Class',
    perception: 'Perception',
    speed: 'Speed',
    swim: 'Swim speed',
    fly: 'Fly speed',
    climb: 'Climb speed',
    burrow: 'Burrow speed',
    classDc: 'Class DC'
  },
  ru: {
    armorClass: 'Класс брони',
    perception: 'Восприятие',
    speed: 'Скорость',
    swim: 'Скорость плавания',
    fly: 'Скорость полёта',
    climb: 'Скорость лазания',
    burrow: 'Скорость рытья',
    classDc: 'Классовая СЛ'
  }
}

export const Pathfinder2SharedSenses = (props) => {
  const [locale] = useAppLocale();

  const items = createMemo(() => {
    const result = [{ title: localize(TRANSLATION, locale()).armorClass, value: props.armorClass }];
    if (props.classDc) result.push({ title: localize(TRANSLATION, locale()).classDc, value: props.classDc });
    return result.concat(
      {
        title: localize(TRANSLATION, locale()).perception,
        value:
          <Dice
            width="36"
            height="36"
            text={modifier(props.perception)}
            onClick={() => props.openDiceRoll('/check initiative empty', props.perception)}
          />
      },
      { title: localize(TRANSLATION, locale()).speed, value: props.speed }
    );
  });

  return (
    <StatsBlock items={items()}>
      <Show when={Object.keys(props.speeds).length > 0}>
        <div class="flex flex-col items-end gap-1 p-4 pt-0">
          <For each={Object.entries(props.speeds)}>
            {([key, value]) =>
              <p class="text-sm">{localize(TRANSLATION, locale())[key]} - {value}</p>
            }
          </For>
        </div>
      </Show>
    </StatsBlock>
  );
}
