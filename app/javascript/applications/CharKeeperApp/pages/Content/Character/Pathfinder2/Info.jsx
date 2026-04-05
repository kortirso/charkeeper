import { For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Text, Checkbox, Label } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    subrace: 'Ancestry',
    background: 'Background',
    class: 'Class',
    heroPoints: 'Hero points'
  },
  ru: {
    subrace: 'Раса',
    background: 'Происхождение',
    class: 'Класс',
    heroPoints: 'Очки героизма'
  },
  es: {
    subrace: 'Ancestría',
    background: 'Background',
    class: 'Class',
    heroPoints: 'Hero points'
  }
}

export const Pathfinder2Info = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const renderClass = () => {
    if (!props.character.info.subclass) return props.character.info.class;

    return `${props.character.info.class} (${props.character.info.subclass})`;
  }

  const gainPoint = () => replaceCharacter({ hero_points: character().hero_points + 1 });

  const lostPoint = () => {
    const newValue = character().hero_points > 0 ? (character().hero_points - 1) : 0;
    replaceCharacter({ hero_points: newValue });    
  }

  const replaceCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(payload);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Info' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <div class="flex flex-col md:flex-row justify-between items-start">
            <p class="character-info-title">{character().name}</p>
            <div class="flex items-center">
              <Label labelText={localize(TRANSLATION, locale()).heroPoints} labelClassList="mr-2" />
              <For each={[...Array((character().hero_points || 0))]}>
                {() =>
                  <Checkbox checked classList="mr-1" onToggle={lostPoint} />
                }
              </For>
              <For each={[...Array(3 - (character().hero_points || 0))]}>
                {() =>
                  <Checkbox classList="mr-1" onToggle={gainPoint} />
                }
              </For>
            </div>
          </div>
          <div class="character-info-grid">
            <For each={['subrace', 'background']}>
              {(item) =>
                <Text
                  containerClassList="character-info-item"
                  labelText={localize(TRANSLATION, locale())[item]}
                  labelClassList="character-info-text"
                  text={character().info[item]}
                />
              }
            </For>
            <Text
              containerClassList="character-info-item"
              labelText={localize(TRANSLATION, locale()).class}
              labelClassList="character-info-text"
              text={renderClass()}
            />
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
