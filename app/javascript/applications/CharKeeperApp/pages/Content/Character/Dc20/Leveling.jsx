import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Toggle, Checkbox, Select } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale } from '../../../../context';
import { Arrow, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchTalentsRequest } from '../../../../requests/fetchTalentsRequest';
import { createTalentRequest } from '../../../../requests/createTalentRequest';
import { fetchTalentFeaturesRequest } from '../../../../requests/fetchTalentFeaturesRequest';
import { translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
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
    selectTalent: 'Select new talent',
    selectMulticlassFeature: 'Select multiclass feature',
    selectSubclass: 'Select subclass',
    paragon: 'Paragon'
  },
  ru: {
    currentLevel: 'уровень',
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
    selectTalent: 'Выберите новый талант',
    selectMulticlassFeature: 'Выберите черту любого класса',
    selectSubclass: 'Выберите подкласс',
    paragon: 'Эталон'
  }
}

export const Dc20Leveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [selectedTalent, setSelectedTalent] = createSignal(null);
  const [selectedMultiTalent, setSelectedMultiTalent] = createSignal(null);
  const [subclass, setSubclass] = createSignal(null);

  const [talents, setTalents] = createSignal(undefined);
  const [talentFeatures, setTalentFeatures] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const fetchTalents = async () => await fetchTalentsRequest(appState.accessToken, character().provider, character().id);
  const fetchTalentFeatures = async (level) => await fetchTalentFeaturesRequest(appState.accessToken, character().provider, character().id, level);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchTalents()]).then(
      ([talentsData]) => {
        batch(() => {
          setTalents(talentsData.talents);
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const availableTalents = createMemo(() => {
    if (talents() === undefined) return {};

    return talents().filter((item) => item.multiple || !item.selected).reduce((acc, item) => { acc[item.id] = item.title; return acc }, {});
  });

  const availableSubclasses = createMemo(() => {
    const result = translate(config.classes[character().main_class].subclasses, locale());

    result['paragon'] = TRANSLATION[locale()].paragon;

    return result;
  });

  const changeManeuver = (value) => {
    const newValue = character().maneuvers.includes(value) ? character().maneuvers.filter((item) => item !== value) : character().maneuvers.concat([value]);
    updateCharacter({ maneuvers: newValue })
  }

  const levelUp = async () => {
    await updateCharacter({ level: character().level + 1 });

    const result = await fetchTalents();
    setTalents(result.talents);
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
  }

  const modifySelectedTalent = async (value) => {
    const talent = talents().find((item) => item.id === value);

    setSelectedTalent(talent);

    if (talent.origin_value === 'multiclass') {
      const result = await fetchTalentFeatures(1);
      setTalentFeatures(result.talents)
    } else {
      batch(() => {
        setTalentFeatures([]);
        setSelectedMultiTalent(undefined);
      });
    }
  }

  const modifySelectedMultiTalent = async (value) => {
    const talent = talentFeatures().find((item) => item.id === value);
    setSelectedMultiTalent(talent);
  }

  const saveTalent = async () => {
    const result = await createTalentRequest(appState.accessToken, character().provider, character().id, { talent_id: selectedTalent().id, talent_feature_id: selectedMultiTalent()?.id });

    if (result.errors_list === undefined) {
      props.onReloadCharacter();
      setSelectedTalent(null);
    }
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
            <Button default classList="rounded mr-4" onClick={levelUp}>
              <Arrow top />
            </Button>
            <p class="dark:text-snow">
              <Show
                when={character().subclass}
                fallback={config.classes[character().main_class].name[locale()]}
              >
                {character().subclass === 'paragon' ? TRANSLATION[locale()].paragon : config.classes[character().main_class].subclasses[character().subclass].name[locale()]}
              </Show>
              {' '}- {character().level} {TRANSLATION[locale()].currentLevel}
            </p>
          </div>

          <Show when={!character().subclass}>
            <Select
              labelText={TRANSLATION[locale()].selectSubclass}
              containerClassList="mt-2"
              items={availableSubclasses()}
              selectedValue={subclass()}
              onSelect={setSubclass}
            />
            <Show when={subclass()}>
              <Button default textable size="small" classList="inline-block mt-2" onClick={() => updateCharacter({ subclass: subclass() })}>
                {TRANSLATION[locale()].saveButton}
              </Button>
            </Show>
          </Show>
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
              <p>{TRANSLATION[locale()].talents}</p>
              <p>{TRANSLATION[locale()].existingTalentPoints} - {character().talent_points - Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0)}</p>
            </div>
          }
        >
          <Show when={talents() && Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0) > 0}>
            <p class="text-sm mb-2">{TRANSLATION[locale()].selectedTalents}</p>
            <For each={Object.entries(character().selected_talents)}>
              {([id, amount]) =>
                <p class="text-lg">{talents().find((item) => item.id === id).title}{amount > 1 ? ` - ${amount}` : ''}</p>
              }
            </For>
            <div class="mb-2" />
          </Show>
          <Show when={character().talent_points > Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0)}>
            <Select
              labelText={TRANSLATION[locale()].selectTalent}
              containerClassList="flex-1"
              items={availableTalents()}
              selectedValue={selectedTalent()?.id}
              onSelect={modifySelectedTalent}
            />
            <Show when={selectedTalent()}>
              <p
                class="feat-markdown text-xs mt-1"
                innerHTML={selectedTalent().description} // eslint-disable-line solid/no-innerhtml
              />
              <Show when={selectedTalent().origin_value === 'multiclass' && talentFeatures()}>
                <Select
                  labelText={TRANSLATION[locale()].selectMulticlassFeature}
                  containerClassList="flex-1 mt-1"
                  items={talentFeatures().reduce((acc, item) => { acc[item.id] = item.title; return acc }, {})}
                  selectedValue={selectedMultiTalent()?.id}
                  onSelect={modifySelectedMultiTalent}
                />
              </Show>
              <Button default textable size="small" classList="inline-block mt-2" onClick={saveTalent}>
                {TRANSLATION[locale()].saveButton}
              </Button>
            </Show>
          </Show>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
