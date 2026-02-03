import { For } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { modifier, localize } from '../../../../helpers';

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
        <div class="blockable pt-2 pb-4">
          <p class="text-lg dark:text-snow mb-2 text-center">{localize(TRANSLATION, locale())['savings']}</p>
          <div class="grid grid-cols-3 emd:grid-cols-6 elg:grid-cols-3 exl:grid-cols-6 gap-2">
            <For each={Object.entries(config.abilities)}>
              {([slug, ability]) =>
                <div class="flex flex-col items-center">
                  <p class="uppercase text-sm mb-4 dark:text-snow">
                    {ability.name[locale()]}
                  </p>
                  <div class="flex items-center">
                    <p class="text-2xl font-normal! dark:text-snow">
                      <Dice
                        text={modifier(character().save_dc[slug])}
                        onClick={() => props.openDiceRoll(`/check save ${slug}`, character().save_dc[slug])}
                      />
                    </p>
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
