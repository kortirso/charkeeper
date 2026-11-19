import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    defenses: {
      physical: 'Physical defense',
      cognitive: 'Congitive defense',
      spiritual: 'Spiritual defense'
    },
    movement: 'Movement',
    deflect: 'Deflect',
    senses_range: 'Senses'
  },
  ru: {
    defenses: {
      physical: 'Физическая защита',
      cognitive: 'Когнитивная защита',
      spiritual: 'Духовная защита'
    },
    movement: 'Скорость',
    deflect: 'Отражение',
    senses_range: 'Чувства'
  },
  es: {
    defenses: {
      physical: 'Defensa física',
      cognitive: 'Defensa cognitiva',
      spiritual: 'Defensa espiritual'
    },
    movement: 'Movimiento',
    deflect: 'Deflección',
    senses_range: 'Sentidos'
  }
}

export const CosmereDefenses = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereDefenses' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4">
          <div class="grid grid-cols-1 gap-4">
            <For each={[['physical', 'cognitive', 'spiritual'], ['movement', 'deflect', 'senses_range']]}>
              {(items, index) =>
                <div class="grid grid-cols-3 gap-2">
                  <For each={items}>
                    {(item) =>
                      <div>
                        <p class="stat-title px-4 emd:px-0">
                          {index() === 0 ? localize(TRANSLATION, locale()).defenses[item] : localize(TRANSLATION, locale())[item]}
                        </p>
                        <div class="dc20-stat-value-box">
                          <p class="dc20-stat-value">
                            {index() === 0 ? character().defense[item] : character()[item]}
                          </p>
                        </div>
                      </div>
                    }
                  </For>
                </div>
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
