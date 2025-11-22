import { createSignal, createEffect, createMemo, Show, For } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Toggle, Checkbox, Select } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale } from '../../../../context';
import { Arrow, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'Current level',
    paths: 'Character paths',
    existingPoints: 'Available path points',
    martialPathLevel: 'Martial path level',
    spellcasterPathLevel: 'Spellcaster path level',
    title: 'You gain additional benefits from a Talent Path: Martial Path or Spellcaster Path',
    maneuvers: 'Maneuvers',
    maneuverPoints: 'Available maneuvers',
    attack: {
      title: 'Attack maneuvers',
      description: 'Attack Maneuvers modify your Martial Attacks with additional damage, range, or targets.'
    },
    save: {
      title: 'Save maneuvers',
      description: 'Save Maneuvers modify your Martial Attacks with additional effects that impose debilitating Conditions.'
    },
    grapple: {
      title: 'Grapple maneuvers',
      description: 'Grapple Maneuvers modify your Grapple Checks with additional slams, pins, throws, and other effects.'
    },
    defense: {
      title: 'Defense maneuvers',
      description: 'Defense Maneuvers enable you to avoid or mitigate taking damage by blocking, deflecting, or dodging Attacks.'
    },
    talents: 'Talents',
    existingTalentPoints: 'Available talents',
    selectedTalents: 'Selected talents',
    saveButton: 'Save',
    selectTalent: 'Select new talent'
  },
  ru: {
    currentLevel: 'Текущий уровень',
    paths: 'Пути персонажа',
    existingPoints: 'Доступные очки пути',
    martialPathLevel: 'Развитие пути бойца',
    spellcasterPathLevel: 'Развитие пути мага',
    title: 'Вы получаете дополнительные преимущества от Пути Таланта: Пути бойца или Пути мага',
    maneuvers: 'Приёмы',
    maneuverPoints: 'Доступные приёмы',
    attack: {
      title: 'Приёмы атаки',
      description: 'Улучшают ваши Бойцовские Атаки, увеличивая урон, дальность или количество целей.'
    },
    save: {
      title: 'Приёмы со спасом',
      description: 'Дополняют ваши Бойцовские Атакиэффектами, накладывающими Состояния.'
    },
    grapple: {
      title: 'Приёмы захвата',
      description: 'Дополняют ваши Проверки Захвата, бросками, толчками и другими эффектами.'
    },
    defense: {
      title: 'Приёмы защиты',
      description: 'Позволяют вам снижать получаемый урон или избегать его, используя блокирование, парирование и уклонение.'
    },
    talents: 'Таланты',
    existingTalentPoints: 'Доступно талантов',
    selectedTalents: 'Выбранные таланты',
    saveButton: 'Сохранить',
    selectTalent: 'Выберите новый талант'
  }
}

export const Dc20Leveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [selectedTalent, setSelectedTalent] = createSignal(null);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const availableTalents = createMemo(() => {
    const selectedFeatures = character().features.map(({ slug }) => slug);

    const result = Object.entries(config.talents).filter(([slug, values]) => {
      if (values.level && values.level > character().level) return false;
      if (values.required_features && values.required_features.filter((item) => selectedFeatures.includes(item)).length !== values.required_features.length) return false;
      if (!values.multiple && character().talents.includes(slug)) return false

      return true;
    });
    return Object.fromEntries(result);
  });

  const changeManeuver = (value) => {
    const newValue = character().maneuvers.includes(value) ? character().maneuvers.filter((item) => item !== value) : character().maneuvers.concat([value]);
    updateCharacter({ maneuvers: newValue })
  }

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
        <Toggle
          title={
            <div class="flex justify-between">
              <p>{TRANSLATION[locale()]['paths']}</p>
              <p>{TRANSLATION[locale()]['existingPoints']} - {character().path_points}</p>
            </div>
          }
        >
          <p class="dark:text-snow mb-2 text-sm">{TRANSLATION[locale()]['title']}</p>
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
        <Toggle
          title={
            <div class="flex justify-between">
              <p>{TRANSLATION[locale()]['maneuvers']}</p>
              <p>{TRANSLATION[locale()]['maneuverPoints']} - {character().maneuver_points - character().maneuvers.length}</p>
            </div>
          }
        >
          <For each={['attack', 'save', 'grapple', 'defense']}>
            {(item) =>
              <div class="mb-8">
                <p class="dark:text-snow mb-2">{TRANSLATION[locale()][item]['title']}</p>
                <p class="dark:text-snow mb-2 text-sm">{TRANSLATION[locale()][item]['description']}</p>
                <div class="flex flex-wrap gap-x-4 gap-y-2">
                  <For each={Object.entries(config.maneuvers).filter(([, values]) => values.type === item)}>
                    {([slug, values]) =>
                      <Checkbox
                        labelText={values.name[locale()]}
                        labelPosition="right"
                        labelClassList="ml-2"
                        checked={character().maneuvers.includes(slug)}
                        onToggle={() => changeManeuver(slug)}
                      />
                    }
                  </For>
                </div>
              </div>
            }
          </For>
        </Toggle>
        <Toggle
          title={
            <div class="flex justify-between">
              <p>{TRANSLATION[locale()]['talents']}</p>
              <p>{TRANSLATION[locale()]['existingTalentPoints']} - {character().talent_points - character().talents.length}</p>
            </div>
          }
        >
          <Show when={character().talents.length > 0}>
            <p class="text-sm mb-2">{TRANSLATION[locale()]['selectedTalents']}</p>
            <For each={character().talents}>
              {(talent) =>
                <p class="text-lg">{config.talents[talent].name[locale()]}</p>
              }
            </For>
          </Show>
          <Show when={character().talent_points > character().talents.length}>
            <Select
              labelText={TRANSLATION[locale()]['selectTalent']}
              containerClassList="flex-1 mt-4"
              items={translate(availableTalents(), locale())}
              selectedValue={selectedTalent()}
              onSelect={setSelectedTalent}
            />
            <Show when={selectedTalent()}>
              <Button default textable size="small" classList="inline-block mt-2" onClick={() => updateCharacter({ talents: [...character().talents, selectedTalent()] })}>{TRANSLATION[locale()]['saveButton']}</Button>
            </Show>
          </Show>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
