import { createSignal, createEffect, Show } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Toggle } from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { Arrow, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

const TRANSLATION = {
  en: {
    currentLevel: 'Current level',
    paths: 'Character paths',
    existingPoints: 'Existing path points',
    martialPathLevel: 'Martial path level',
    spellcasterPathLevel: 'Spellcaster path level',
    title: 'You gain additional benefits from a Talent Path: Martial Path or Spellcaster Path'
  },
  ru: {
    currentLevel: 'Текущий уровень',
    paths: 'Пути персонажа',
    existingPoints: 'Свободные очки пути',
    martialPathLevel: 'Развитие пути бойца',
    spellcasterPathLevel: 'Развитие пути мага',
    title: 'Вы получаете дополнительные преимущества от Пути Таланта: Пути бойца или Пути мага'
  }
}

export const Dc20Leveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Leveling' }}>
      <GuideWrapper
        character={character()}
        guideStep={4}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <div class="blockable p-4 mb-2">
          <div class="flex items-center">
            <Button
              default
              classList='rounded mr-4'
              onClick={() => updateCharacter({ level: character().level + 1 })}
            >
              <Arrow top />
            </Button>
            <p class="dark:text-snow">{TRANSLATION[locale()]['currentLevel']} - {character().level}</p>
          </div>
        </div>
        <Toggle title={TRANSLATION[locale()]['paths']}>
          <p class="dark:text-snow mb-2">{TRANSLATION[locale()]['title']}</p>
          <Show when={character().path_points > 0}>
            <p class="dark:text-snow mb-2">{TRANSLATION[locale()]['existingPoints']} - {character().path_points}</p>
          </Show>
          <div class="flex items-center gap-x-4 mb-2">
            <Show when={character().path_points > 0}>
              <Button
                default
                size="small"
                onClick={() => updateCharacter({ path_points: character().path_points - 1, paths: { ...character().paths, martial: character().paths.martial + 1 } })}
              >
                <PlusSmall />
              </Button>
            </Show>
            <p class="dark:text-snow">{TRANSLATION[locale()]['martialPathLevel']} - {character().paths.martial}</p>
          </div>
          <div class="flex items-center gap-x-4">
            <Show when={character().path_points > 0}>
              <Button
                default
                size="small"
                onClick={() => updateCharacter({ path_points: character().path_points - 1, paths: { ...character().paths, spellcaster: character().paths.spellcaster + 1 } })}
              >
                <PlusSmall />
              </Button>
            </Show>
            <p class="dark:text-snow">{TRANSLATION[locale()]['spellcasterPathLevel']} - {character().paths.spellcaster}</p>
          </div>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
