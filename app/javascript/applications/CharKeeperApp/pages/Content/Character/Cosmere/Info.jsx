import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import config from '../../../../data/cosmere.json';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    'ancestry': 'Ancestry',
    'cultures': 'Cultures'
  },
  ru: {
    'ancestry': 'Раса',
    'cultures': 'Культуры'
  },
  es: {
    'ancestry': 'Ancestría',
    'cultures': 'Cultures'
  }
}

export const CosmereInfo = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const renderValue = (item) => {
    if (item === 'ancestry') return localize(config.ancestries[character().ancestry].name, locale());
    if (item === 'cultures') return character().cultures.map((item) => localize(config.cultures[item].name, locale())).join(' / ');
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereInfo' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{character().name}</p>
          <div class="character-info-grid">
            <For each={['ancestry', 'cultures']}>
              {(item) =>
                <Text
                  containerClassList="character-info-item"
                  labelText={localize(TRANSLATION, locale())[item]}
                  labelClassList="character-info-text"
                  text={renderValue(item)}
                />
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
