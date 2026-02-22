import { createMemo, For, Show } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text } from '../../../../components';
import config from '../../../../data/dnd5.json';
import configNext from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';

const TRANSLATION = {
  en: {
    alignment: 'Alignment',
    background: 'Background',
    species: 'Species',
    legacy: 'Legacy',
    race: 'Race',
    subrace: 'Subrace'
  },
  ru: {
    alignment: 'Мировоззрение',
    background: 'Происхождение',
    species: 'Вид',
    legacy: 'Подвид',
    race: 'Раса',
    subrace: 'Подраса'
  },
  es: {
    alignment: 'Alignment',
    background: 'Background',
    species: 'Species',
    legacy: 'Legacy',
    race: 'Race',
    subrace: 'Subrace'
  }
}

export const Dnd5Info = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  const availableKeys = createMemo(() => {
    if (character().provider === 'dnd5') return ['alignment', 'race', 'subrace'];
    if (character().provider === 'dnd2024') return ['alignment', 'species', 'legacy', 'background'];

    return [];
  })

  const renderValue = (item) => {
    if (item === 'alignment') return configNext.alignments[character().alignment].name[locale()];
    if (item === 'species') return configNext.species[character().species].name[locale()];
    if (item === 'legacy' && character().legacy) return configNext.species[character().species].legacies[character().legacy].name[locale()];
    if (item === 'background') return configNext.backgrounds[character().background].name[locale()];

    if (item === 'race') return config.races[character().race].name[locale()];
    if (item === 'subrace' && character().subrace) return config.races[character().race].subraces[character().subrace].name[locale()];

    return character()[item];
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Info' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="character-info-title">{character().name}</p>
          <div class="character-info-grid">
            <For each={availableKeys()}>
              {(item) =>
                <Show when={character()[item]}>
                  <Text
                    labelText={TRANSLATION[locale()][item]}
                    labelClassList="character-info-text"
                    text={renderValue(item)}
                  />
                </Show>
              }
            </For>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
