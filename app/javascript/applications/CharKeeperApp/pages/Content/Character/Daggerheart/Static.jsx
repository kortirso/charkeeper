import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper } from '../../../../components';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    proficiency: 'Proficiency',
    evasion: 'Evasion',
    armor_score: 'Armor Score'
  },
  ru: {
    proficiency: 'Мастерство',
    evasion: 'Уклонение',
    armor_score: 'Очки Доспеха'
  },
  es: {
    proficiency: 'Competencia',
    evasion: 'Evasión',
    armor_score: 'Puntuación de armadura'
  }
}

export const DaggerheartStatic = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartStatic' }}>
      <GuideWrapper character={character()}>
        <div class="dh-static-box">
          <For each={['proficiency', 'evasion', 'armor_score']}>
            {(slug) =>
              <div class="flex-1">
                <p class="dh-static-title">{TRANSLATION[locale()][slug]}</p>
                <p class="dh-static-value">{character()[slug]}</p>
              </div>
            }
          </For>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
