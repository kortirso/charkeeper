import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    health: 'Health',
    focus: 'Focus',
    investiture: 'Investiture',
  },
  ru: {
    health: 'Здоровье',
    focus: 'Фокус',
    investiture: 'Инвеститура',
  }
}

export const CosmereHealth = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereHealth' }}>
      <GuideWrapper character={character()}>
        <div class="blockable py-4">
          <div class="grid grid-cols-3 gap-2">
            <For each={['health', 'focus', 'investiture']}>
              {(item) =>
                <div>
                  <p class="stat-title px-4 emd:px-0">{localize(TRANSLATION, locale())[item]}</p>
                  <div class="dc20-stat-value-box">
                    <p class="dc20-stat-value text-xl! md:text-lg!">{character()[item]} / {character()[`${item}_max`]}</p>
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
