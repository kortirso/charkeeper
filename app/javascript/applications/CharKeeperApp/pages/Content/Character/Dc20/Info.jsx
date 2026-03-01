import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import config from '../../../../data/dc20.json';
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
    'ancestry': 'Ancestry',
    'size': 'Size'
  }
}

export const Dc20Info = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const renderValue = (item) => {
    if (item === 'ancestry') return character().ancestries.map((item) => localize(config.ancestries[item].name, locale())).join(' / ');
    if (item === 'size') return localize(config.sizes[character().size].name, locale());
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Info' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{character().name}</p>
          <div class="character-info-grid">
            <For each={['ancestry', 'size']}>
              {(item) =>
                <Text
                  containerClassList="character-info-item"
                  labelText={TRANSLATION[locale()][item]}
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
