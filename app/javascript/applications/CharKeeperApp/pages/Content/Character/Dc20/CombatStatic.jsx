import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Dice } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    combatMastery: 'Combat mastery',
    initiative: 'Initiative',
    precision: 'Precision defense',
    area: 'Area defense',
    attack: 'Attack'
  },
  ru: {
    combatMastery: 'Мастерство боя',
    initiative: 'Инициатива',
    precision: 'Точечная защита',
    area: 'Площадная защита',
    attack: 'Атака'
  },
  es:{
    combatMastery: 'Maestría de combate',
    initiative: 'Iniciativa',
    precision: 'Defensa de precisión',
    area: 'Defensa de área',
    attack: 'Ataque'
  }
}

export const Dc20CombatStatic = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20CombatStatic' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4">
          <div class="grid grid-cols-1 gap-2">
            <div class="grid grid-cols-3 gap-2">
              <For
                each={[
                  { label: 'combatMastery', value: character().combat_mastery },
                  { label: 'precision', value: character().precision_defense.default },
                  { label: 'area', value: character().area_defense.default },
                ]}
              >
                {(item) =>
                  <div>
                    <p class="stat-title px-4 emd:px-0">{localize(TRANSLATION, locale())[item.label]}</p>
                    <div class="dc20-stat-value-box">
                      <p class="dc20-stat-value">{item.value}</p>
                    </div>
                  </div>
                }
              </For>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <For
                each={[
                  { label: 'initiative', value: character().initiative },
                  { label: 'attack', value: character().attack }
                ]}
              >
                {(item) =>
                  <div>
                    <p class="stat-title">{localize(TRANSLATION, locale())[item.label]}</p>
                    <div class="dc20-stat-value-box">
                      <p class="dc20-stat-value">
                        <Dice
                          text={modifier(item.value)}
                          onClick={() => props.openDiceRoll(`/check ${item.label} self`, item.value)}
                        />
                      </p>
                    </div>
                  </div>
                }
              </For>
            </div>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
