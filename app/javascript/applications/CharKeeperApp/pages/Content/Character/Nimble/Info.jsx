import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    'ancestry': 'Ancestry',
    'size': 'Size'
  },
  ru: {
    'ancestry': 'Раса',
    'size': 'Размер'
  },
  es: {
    'ancestry': 'Ancestría',
    'size': 'Tamaño'
  }
}

export const NimbleInfo = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const renderValue = (item) => {
    if (item === 'ancestry') return localize(config.ancestries[character().ancestry].name, locale());
    if (item === 'size') return localize(config.sizes[character().size].name, locale());
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleInfo' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{character().name}</p>
          <div class="character-info-grid">
            <For each={['ancestry', 'size']}>
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
