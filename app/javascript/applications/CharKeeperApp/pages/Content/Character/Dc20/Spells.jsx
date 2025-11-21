import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    mana_spend_limit: 'Mana spend limit',
    cantrips: 'Cantrips',
    spells: 'Spells'
  },
  ru: {
    mana_spend_limit: 'Предел траты маны',
    cantrips: 'Заговоры',
    spells: 'Заклинания'
  }
}

export const Dc20Spells = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Spells' }}>
      <GuideWrapper character={character()}>
        <div class="blockable grid grid-cols-3 justify-center gap-2">
          <For each={['mana_spend_limit', 'cantrips', 'spells']}>
            {(item) =>
              <div class="py-4 px-2">
                <p class="text-sm uppercase text-center mb-4 dark:text-snow">{TRANSLATION[locale()][item]}</p>
                <div class="mx-auto flex items-center justify-center">
                  <p class="text-2xl font-normal! dark:text-snow">{character()[item]}</p>
                </div>
              </div>
            }
          </For>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
