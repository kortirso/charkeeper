import { For } from 'solid-js';

import { StatsBlock } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';
import config from '../../../../data/pathfinder2.json';

const TRANSLATION = {
  en: {
    level: 'level',
    traditions: 'Traditions',
    cantripsAmount: 'Cantrips amount',
    spellsAmount: 'Spells amount'
  },
  ru: {
    level: 'уровень',
    traditions: 'Традиции',
    cantripsAmount: 'Лимит фокусов',
    spellsAmount: 'Лимит заклинаний'
  }
}

export const Pathfinder2SpellBook = (props) => {
  const spells = () => props.spells;
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <>
      <StatsBlock
        items={[
          { title: localize(TRANSLATION, locale()).cantripsAmount, value: character().spells_info.cantrips_amount },
          { title: localize(TRANSLATION, locale()).spellsAmount, value: character().spells_info.spells_amount }
        ]}
      />
      <div class="flex flex-col gap-2">
        <For each={spells()}>
          {(spell) =>
            <div class="blockable p-2">
              <div class="flex items-center justify-between">
                <p>{spell.title}</p>
                <p>{spell.info.level} {localize(TRANSLATION, locale()).level}</p>
              </div>
              <div class="flex gap-2 flex-wrap mt-1">
                <For each={spell.origin_values}>
                  {(originValue) =>
                    <span class="tag text-sm!">{originValue}</span>
                  }
                </For>
              </div>
              <p class="mt-1 text-sm">{localize(TRANSLATION, locale()).traditions}: {spell.origin_value.map((item) => config.spellLists[item].name[locale()]).join(', ')}</p>
            </div>
          }
        </For>
      </div>
    </>
  );
}
