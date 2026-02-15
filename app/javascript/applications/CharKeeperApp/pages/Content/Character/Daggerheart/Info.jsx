import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    'ancestry_name': 'Heritage',
    'community_name': 'Community'
  },
  ru: {
    'ancestry_name': 'Раса',
    'community_name': 'Общество'
  },
  es: {
    'ancestry_name': 'Heritage',
    'community_name': 'Community'
  }
}

export const DaggerheartInfo = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartInfo' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{character().name}</p>
          <div class="character-info-grid">
            <For each={['ancestry_name', 'community_name']}>
              {(item) =>
                <Text
                  containerClassList="character-info-item"
                  labelText={TRANSLATION[locale()][item]}
                  labelClassList="character-info-text"
                  text={character().names[item]}
                />
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
