import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Select, Checkbox, Button, GuideWrapper, Toggle } from '../../../../components';
import dnd2024Config from '../../../../data/dnd2024.json';
import dnd5Config from '../../../../data/dnd5.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchTalentsRequest } from '../../../../requests/fetchTalentsRequest';
import { createTalentRequest } from '../../../../requests/createTalentRequest';
import { fetchHomebrewsRequest } from '../../../../requests/fetchHomebrewsRequest';
import { translate, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    talents: 'Feats',
    existingTalentPoints: 'Available feats',
    selectTalent: 'Select new feat',
    saveButton: 'Save',
    selectedTalents: 'Selected feats',
    origin: 'Origin',
    general: 'General',
    epic: 'Epic',
    selectAdditionalTalent: 'Select additional feat (if you need)',
    requiredAbility: 'One of abilities should be 13+',
    or: ' or ',
    abilityBoost: 'Ability increase by 1'
  },
  ru: {
    talents: 'Черты',
    existingTalentPoints: 'Доступно черт',
    selectTalent: 'Выберите новую черту',
    saveButton: 'Сохранить',
    selectedTalents: 'Выбранные черты',
    origin: 'Происхождение',
    general: 'Общее',
    epic: 'Эпическая',
    selectAdditionalTalent: 'Выберите дополнительную черту (если хотите)',
    requiredAbility: 'Одна из характеристик должна быть 13+',
    or: ' или ',
    abilityBoost: 'Повышение характеристики на 1'
  }
}

export const Dnd5ClassLevels = (props) => {
  const character = () => props.character;
  const currentConfig = () => character().provider === 'dnd5' ? dnd5Config : dnd2024Config;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);
  const [classesData, setClassesData] = createSignal(character().classes);
  const [subclassesData, setSubclassesData] = createSignal(character().subclasses);

  const [selectedTalent, setSelectedTalent] = createSignal(null);

  const [talents, setTalents] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchTalents = async () => await fetchTalentsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    if (character().provider === 'dnd2024') {
      Promise.all([fetchTalents()]).then(
        ([talentsData]) => {
          setTalents(talentsData.talents);
        }
      );
    }

    batch(() => {
      setClassesData(character().classes);
      setSubclassesData(character().subclasses);
      setLastActiveCharacterId(character().id);
    });
  });

  createEffect(() => {
    if (homebrews() !== undefined) return;
    if (character().provider === 'dnd5') return;

    const fetchHomebrews = async () => await fetchHomebrewsRequest(appState.accessToken);

    Promise.all([fetchHomebrews()]).then(
      ([homebrewsData]) => {
        setHomebrews(homebrewsData);
      }
    );
  });

  const availableTalents = createMemo(() => {
    if (talents() === undefined) return {};

    return talents().filter((item) => item.multiple || !item.selected).reduce((acc, item) => { acc[item.id] = `${item.title} (${localize(TRANSLATION, locale())[item.origin_value]})`; return acc }, {});
  });

  const selectedTalentsCount = createMemo(() => {
    if (!character().selected_talents) return 0;

    return Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0) - character().selected_additional_talents;
  });

  const defaultTalent = createMemo(() => character().available_talents > selectedTalentsCount());

  const classesWithHomebrews = createMemo(() => {
    const result = currentConfig().classes;
    if (character().provider === 'dnd5') return result;
    if (homebrews() === undefined) return result;
    if (!homebrews().dnd2024.subclasses) return result;

    return Object.fromEntries(Object.entries(result).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().dnd2024.subclasses[slug] || {};
      const allSubclasses = { ...values.subclasses, ...homebrewSubclasses };

      return [slug, { ...values, subclasses: allSubclasses }];
    }));
  });

  const classes = () => translate(currentConfig().classes, locale());

  // actions
  /* eslint-disable solid/reactivity */
  const toggleClass = (className) => {
    if (classesData()[className]) {
      const classesResult = Object.keys(classesData())
        .filter(item => item !== className)
        .reduce((acc, item) => { acc[item] = classesData()[item]; return acc; }, {} );

      const subclassesResult = Object.keys(subclassesData())
        .filter(item => item !== className)
        .reduce((acc, item) => { acc[item] = subclassesData()[item]; return acc; }, {} );

      batch(() => {
        setClassesData(classesResult);
        setSubclassesData(subclassesResult);
      });
    } else {
      batch(() => {
        setClassesData({ ...classesData(), [className]: 1 });
        setSubclassesData({ ...subclassesData(), [className]: null });
      });
    }
  }
  /* eslint-enable solid/reactivity */

  const changeClassLevel = (className, direction) => {
    if (direction === 'down' && classesData()[className] === 1) return;

    const newValue = direction === 'up' ? (classesData()[className] + 1) : (classesData()[className] - 1);
    setClassesData({ ...classesData(), [className]: newValue });
  }

  const updateClasses = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { classes: classesData(), subclasses: subclassesData() }, only_head: true }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        renderNotice(t('alerts.characterIsUpdated'));
      });

      const result = await fetchTalents();
      setTalents(result.talents);

    } else renderAlerts(result.errors_list);
  }

  const saveTalent = async () => {
    const result = await createTalentRequest(appState.accessToken, character().provider, character().id, { talent_id: selectedTalent().id, additional: !defaultTalent() });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        setSelectedTalent(null);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5ClassLevels' }}>
      <GuideWrapper
        character={character()}
        guideStep={4}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <div class="blockable p-4 flex flex-col">
          <div class="mb-1">
            <p>{character().subclasses[character().main_class] ? `${classes()[character().main_class]} - ${translate(classesWithHomebrews()[character().main_class].subclasses, locale())[character().subclasses[character().main_class]]}` : classes()[character().main_class]}</p>
            <div class="my-2 flex items-center">
              <div class="flex justify-between items-center mr-4 w-24">
                <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'down')}>
                  <Minus />
                </Button>
                <p>{classesData()[character().main_class]}</p>
                <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'up')}>
                  <PlusSmall />
                </Button>
              </div>
              <div class="flex-1">
                <Show
                  when={Object.keys(classesWithHomebrews()[character().main_class].subclasses).length > 0 && !character().subclasses[character().main_class]}
                  fallback={<></>}
                >
                  <Select
                    containerClassList="w-full"
                    items={translate(classesWithHomebrews()[character().main_class].subclasses, locale())}
                    selectedValue={subclassesData()[character().main_class]}
                    onSelect={(value) => setSubclassesData({ ...subclassesData(), [character().main_class]: value })}
                  />
                </Show>
              </div>
            </div>
          </div>
          <For each={Object.entries(classes()).filter((item) => item[0] !== character().main_class).sort((a,) => !Object.keys(classesData()).includes(a[0]))}>
            {([slug, className]) =>
              <div class="mb-1">
                <Checkbox
                  labelText={character().subclasses[slug] ? `${className} - ${translate(classesWithHomebrews()[slug].subclasses, locale())[character().subclasses[slug]]}` : className}
                  labelPosition="right"
                  labelClassList="ml-4"
                  checked={classesData()[slug]}
                  onToggle={() => toggleClass(slug)}
                />
                <Show when={classesData()[slug]}>
                  <>
                    <div class="my-2 flex items-center">
                      <div class="flex justify-between items-center mr-4 w-24">
                        <Button default size="small" onClick={() => changeClassLevel(slug, 'down')}>
                          <Minus />
                        </Button>
                        <p>{classesData()[slug]}</p>
                        <Button default size="small" onClick={() => changeClassLevel(slug, 'up')}>
                          <PlusSmall />
                        </Button>
                      </div>
                      <div class="flex-1">
                        <Show
                          when={Object.keys(classesWithHomebrews()[slug].subclasses).length > 0 && !character().subclasses[slug]}
                          fallback={<></>}
                        >
                          <Select
                            containerClassList="w-full"
                            items={translate(classesWithHomebrews()[slug].subclasses, locale())}
                            selectedValue={subclassesData()[slug]}
                            onSelect={(value) => setSubclassesData({ ...subclassesData(), [slug]: value })}
                          />
                        </Show>
                      </div>
                    </div>
                  </>
                </Show>
              </div>
            }
          </For>
          <Button default textable classList="mt-2" onClick={updateClasses}>{t('save')}</Button>
        </div>
        <Show when={character().provider === 'dnd2024'}>
          <Toggle
            containerClassList="mt-2"
            title={
              <div class="flex justify-between">
                <p>{localize(TRANSLATION, locale()).talents}</p>
                <p>{localize(TRANSLATION, locale()).existingTalentPoints} - {character().available_talents - selectedTalentsCount()}</p>
              </div>
            }
          >
            <Show when={talents()}>
              <p class="text-sm mb-2">{localize(TRANSLATION, locale()).selectedTalents}</p>
              <Show when={Object.keys(character().selected_talents).length === 0}>-</Show>
              <For each={Object.entries(character().selected_talents)}>
                {([id, amount]) =>
                  <p class="text-lg">{talents().find((item) => item.id === id).title}{amount > 1 ? ` - ${amount}` : ''}</p>
                }
              </For>
            </Show>
            <div class="mt-2">
              <Select
                searchable
                labelText={localize(TRANSLATION, locale())[defaultTalent() ? 'selectTalent' : 'selectAdditionalTalent']}
                items={availableTalents()}
                selectedValue={selectedTalent()?.id}
                onSelect={(value) => setSelectedTalent(talents().find((item) => item.id === value))}
              />
              <Show when={selectedTalent()}>
                <Show when={selectedTalent().conditions.ability && selectedTalent().conditions.ability.length > 0}>
                  <p class="text-sm mt-2">{localize(TRANSLATION, locale()).requiredAbility}: {selectedTalent().conditions.ability.map((item) => dnd2024Config.abilities[item].name[locale()]).join(localize(TRANSLATION, locale()).or)}</p>
                </Show>
                <Show
                  when={selectedTalent().info.rewrite?.ability_boosts && selectedTalent().info.rewrite.ability_boosts.length > 0}
                >
                  <p class="text-sm mt-2">{localize(TRANSLATION, locale()).abilityBoost}: {selectedTalent().info.rewrite.ability_boosts.map((item) => dnd2024Config.abilities[item].name[locale()]).join(localize(TRANSLATION, locale()).or)}</p>
                </Show>
                <p
                  class="feat-markdown mt-2"
                  innerHTML={selectedTalent().description} // eslint-disable-line solid/no-innerhtml
                />
                <Button default textable classList="inline-block mt-4" onClick={saveTalent}>
                  {localize(TRANSLATION, locale()).saveButton}
                </Button>
              </Show>
            </div>
          </Toggle>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
