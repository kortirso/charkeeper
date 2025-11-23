import { For } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    savings: 'Saving throws'
  },
  ru: {
    savings: 'Спасброски'
  }
}

export const Dnd5SavingThrows = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5SavingThrows' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <h2 class="text-lg dark:text-snow mb-2">{TRANSLATION[locale()]['savings']}</h2>
          <div class="grid grid-cols-3 emd:grid-cols-2 gap-4">
            <For each={Object.entries(config.abilities)}>
              {([slug, ability]) =>
                <div class="flex flex-col items-center">
                  <p class="uppercase text-sm elg:text-[14px] mb-1 dark:text-snow">
                    {ability.name[locale()]}
                  </p>
                  <div class="flex items-center">
                    <Dice
                      text={modifier(character().save_dc[slug])}
                      onClick={() => props.openDiceRoll(`/check save ${slug}`, character().save_dc[slug])}
                    />
                  </div>
                </div>
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
