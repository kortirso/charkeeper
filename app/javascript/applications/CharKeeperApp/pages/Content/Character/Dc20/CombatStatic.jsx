import { ErrorWrapper, GuideWrapper, Dice } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    combatMastery: 'Combat mastery',
    initiative: 'Initiative',
    precision: 'Precision defense',
    area: 'Area defense'
  },
  ru: {
    combatMastery: 'Мастерство боя',
    initiative: 'Инициатива',
    precision: 'Точечная защита',
    area: 'Площадная защита'
  }
}

export const Dc20CombatStatic = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20CombatStatic' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4 dark:text-snow">
          <div class="grid grid-cols-2 emd:grid-cols-4 justify-center gap-x-2 gap-y-4">
            <div>
              <p class="text-sm uppercase text-center mb-2">{TRANSLATION[locale()]['combatMastery']}</p>
              <div class="mx-auto flex items-center justify-center">
                <p class="text-2xl font-normal! leading-10">{character().combat_mastery}</p>
              </div>
            </div>
            <div>
              <p class="text-sm uppercase text-center mb-2">{TRANSLATION[locale()]['initiative']}</p>
              <div class="mx-auto flex items-center justify-center">
                <p class="text-2xl font-normal!">
                  <Dice
                    text={modifier(character().initiative)}
                    onClick={() => props.openDiceRoll('/check initiative self', character().initiative)}
                  />
                </p>
              </div>
            </div>
            <div>
              <p class="text-sm uppercase text-center mb-2">{TRANSLATION[locale()]['precision']}</p>
              <div class="mx-auto flex items-center justify-center">
                <p class="text-2xl font-normal! leading-10">{character().precision_defense.default}</p>
              </div>
            </div>
            <div>
              <p class="text-sm uppercase text-center mb-2">{TRANSLATION[locale()]['area']}</p>
              <div class="mx-auto flex items-center justify-center">
                <p class="text-2xl font-normal! leading-10">{character().area_defense.default}</p>
              </div>
            </div>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
