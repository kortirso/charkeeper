import { ErrorWrapper, GuideWrapper } from '../../../../components';
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
        <div class="grid grid-cols-2 emd:grid-cols-4 justify-center gap-2">
          <div class="blockable py-4">
            <p class="text-sm uppercase text-center mb-4 dark:text-snow">{TRANSLATION[locale()]['combatMastery']}</p>
            <div class="mx-auto flex items-center justify-center">
              <p class="text-2xl font-normal! dark:text-snow">{character().combat_mastery}</p>
            </div>
          </div>
          <div class="blockable py-4">
            <p class="text-sm uppercase text-center mb-4 dark:text-snow">{TRANSLATION[locale()]['initiative']}</p>
            <div class="mx-auto flex items-center justify-center">
              <p class="text-2xl font-normal! dark:text-snow">{modifier(character().initiative)}</p>
            </div>
          </div>
          <div class="blockable py-4">
            <p class="text-sm uppercase text-center mb-4 dark:text-snow">{TRANSLATION[locale()]['precision']}</p>
            <div class="mx-auto flex items-center justify-center">
              <p class="text-2xl font-normal! dark:text-snow">{character().precision_defense.default}</p>
            </div>
          </div>
          <div class="blockable py-4">
            <p class="text-sm uppercase text-center mb-4 dark:text-snow">{TRANSLATION[locale()]['area']}</p>
            <div class="mx-auto flex items-center justify-center">
              <p class="text-2xl font-normal! dark:text-snow">{character().area_defense.default}</p>
            </div>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
