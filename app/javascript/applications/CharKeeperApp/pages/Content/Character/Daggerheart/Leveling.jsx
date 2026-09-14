import { createMemo, createSignal, createEffect, For, Show, batch } from 'solid-js';

import { Select, Checkbox, Button, ErrorWrapper, GuideWrapper, LevelUp } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchHomebrewsRequest } from '../../../../requests/fetchHomebrewsRequest';
import { translate, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'Current level',
    title: 'Available level up slots',
    traits: '+1 bonus to two character traits',
    health: 'Additional Hit Point slots',
    stress: 'Additional Stress slots',
    experience: '+1 bonus to two Experiences',
    domainCards: 'Additional domain cards',
    evasion: '+1 bonus to Evasion',
    reset: 'Reset',
    save: 'Save',
    traitsSelect: 'Select traits for this tier',
    classSelect: 'Select class for multiclassing',
    subclassSelect: 'Select subclass for new class',
    subclassMasterySelect: 'Select class for upgrade subclass mastery',
    selectDomain: 'Select domain from new class',
    proficiency: '+1 bonus to Proficiency',
    subclass: 'Upgrade subclass',
    multiclass: 'Choose additional class',
    multiclassTooltip: 'Saving multiclass selection is not revertable, be careful!',
    subclassTooltip: 'Saving subclass upgrade is not revertable, be careful!',
    warning: 'Mark all level up slots before leveling'
  },
  ru: {
    currentLevel: 'Текущий уровень',
    title: 'Доступные слоты повышения уровня',
    traits: '+1 бонус к двум характеристикам',
    health: 'Дополнительные слоты ран',
    stress: 'Дополнительные слоты стресса',
    experience: '+1 бонус к двум опытам',
    domainCards: 'Дополнительные карты доменов',
    evasion: '+1 бонус к уклонению',
    reset: 'Сбросить',
    save: 'Сохранить',
    traitsSelect: 'Выберите характеристики на этом ранге',
    classSelect: 'Выберите класс для мультиклассицирования',
    subclassSelect: 'Выберите подкласс для нового класса',
    subclassMasterySelect: 'Выберите класс для улучшения подкласса',
    selectDomain: 'Выберите домен от нового класса',
    proficiency: '+1 бонус к мастерству',
    subclass: 'Улучшить подкласс',
    multiclass: 'Выберите дополнительный класс',
    multiclassTooltip: 'Сохранение выбора мультикласса необратимо, осторожно!',
    subclassTooltip: 'Сохранение выбора улучшения мастерства подкласса необратимо, осторожно!',
    warning: 'Отметьте все слоты повышения уровня'
  },
  es:{
    currentLevel: 'Nivel actual',
    title: 'Ranuras de subida de nivel disponibles',
    traits: 'Bonificador +1 a dos atributos',
    health: 'Ranuras de Puntos de Vida adicionales',
    stress: 'Ranuras de Estrés adicionales',
    experience: 'Bonificador +1 a dos Experiencias',
    domainCards: 'Cartas de dominio adicionales',
    evasion: 'Bonificador +1 a la Evasión',
    reset: 'Restablecer',
    save: 'Guardar',
    traitsSelect: 'Seleccionar atributos para este nivel',
    classSelect: 'Seleccionar clase para multiclase',
    subclassSelect: 'Seleccionar subclase para la nueva clase',
    subclassMasterySelect: 'Seleccionar clase para mejorar maestría de subclase',
    selectDomain: 'Seleccionar dominio de la nueva clase',
    proficiency: 'Bonificador +1 a la Competencia',
    subclass: 'Mejorar subclase',
    multiclass: 'Elegir clase adicional',
    multiclassTooltip: 'Guardar la selección de multiclase no es reversible, ¡ten cuidado!',
    subclassTooltip: 'Guardar la mejora del dominio de subclase no es reversible, ¡ten cuidado!',
    warning: 'Marca todas las ranuras de subida de nivel antes de subir de nivel'
  }
}

export const DaggerheartLeveling = (props) => {
  const character = () => props.character;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [levelingData, setLevelingData] = createSignal(undefined);
  const [newClass, setNewClass] = createSignal(null);
  const [newSubclass, setNewSubclass] = createSignal(null);
  const [domainsData, setDomainsData] = createSignal(character().domains);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setLevelingData(character().leveling);
      setLastActiveCharacterId(character().id);
    });
  });

  createEffect(() => {
    if (homebrews() !== undefined) return;

    const fetchHomebrews = async () => await fetchHomebrewsRequest(appState.accessToken);

    Promise.all([fetchHomebrews()]).then(
      ([homebrewsData]) => {
        setHomebrews(homebrewsData);
      }
    );

    setDomainsData(character().domains);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales['daggerheart'];
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;
    return locale();
  });

  const daggerheartClasses = createMemo(() => {
    if (homebrews() === undefined) return {};

    const currentClasses = Object.keys(character().classes);

    const defaultClasses = Object.fromEntries(Object.entries(config.classes).filter(([slug]) => !currentClasses.includes(slug)).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};
      const allSubclasses = { ...values.subclasses, ...homebrewSubclasses };

      return [slug, { ...values, subclasses: allSubclasses }];
    }));

    const homebrewClasses = Object.fromEntries(Object.entries(homebrews().daggerheart.classes).filter(([slug]) => !currentClasses.includes(slug)).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};

      return [slug, { ...values, subclasses: homebrewSubclasses }];
    }));

    return { ...defaultClasses, ...homebrewClasses };
  });

  const existingClasses = createMemo(() => {
    if (homebrews() === undefined) return {};

    const currentClasses = Object.keys(character().classes);

    const defaultClasses = Object.fromEntries(Object.entries(config.classes).filter(([slug]) => currentClasses.includes(slug)).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};
      const allSubclasses = { ...values.subclasses, ...homebrewSubclasses };

      return [slug, { ...values, subclasses: allSubclasses }];
    }));

    const homebrewClasses = Object.fromEntries(Object.entries(homebrews().daggerheart.classes).filter(([slug]) => currentClasses.includes(slug)).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};

      return [slug, { ...values, subclasses: homebrewSubclasses }];
    }));

    return { ...defaultClasses, ...homebrewClasses };
  })

  const levelPoints = createMemo(() => (character().level - 1) * 2);
  const classDomains = createMemo(() => translate(config.domains, currentLocale()));

  const spendLevelPoints = createMemo(() => {
    if (!levelingData()) return 0;

    let result = 0;
    Object.entries(levelingData()).forEach(([slug, value]) => {
      if (value === 0) return;
      else if (slug === 'selected_traits') return;
      else if (slug === 'traits') Object.values(value).forEach((item) => result += item);
      else if (slug === 'proficiency' || slug === 'multiclass') result += (value * 2);
      else result += value;
    });

    return result;
  });

  const selectDomain = (classSlug, value) => setDomainsData({ ...domainsData(), [classSlug]: value });

  const updateLeveling = (key, value) => {
    let newValue;
    if (key === 'traits') {
      newValue = levelingData()[key];
      newValue[character().tier] = newValue[character().tier] === value ? (value - 1) : value;
    } else {
      newValue = levelingData()[key] === value ? (value - 1) : value
    }
    setLevelingData({ ...levelingData(), [key]: newValue });
  }

  const selectTrait = (value) => {
    const newValue = levelingData().selected_traits;
    newValue[character().tier] = newValue[character().tier].includes(value) ? newValue[character().tier].filter((item) => item !== value) : newValue[character().tier].concat([value]);
    setLevelingData({ ...levelingData(), selected_traits: newValue });
  }

  const levelUp = () => {
    const availableLevelPoints = levelPoints() - spendLevelPoints();
    if (availableLevelPoints > 0 && (character().level === 4 || character().level === 7)) {
      return renderAlert(i18n().warning);
    }

    updateCharacter({ level: character().level + 1 });
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
  }

  const updateClasses = async () => {
    let payload = { leveling: levelingData() };
    if (Object.keys(character().classes).length === character().leveling.multiclass && newClass() && newSubclass() && Object.keys(domainsData()).length === character().leveling.multiclass) {
      payload = {
        ...payload,
        classes: { ...character().classes, [newClass()]: 1 },
        subclasses: { ...character().subclasses, [newClass()]: newSubclass() },
        subclasses_mastery: { ...character().subclasses_mastery, [newSubclass()]: 1 },
        domains: domainsData()
      }
    }
    if (Object.values(character().subclasses_mastery).filter((item) => item > 1).reduce((acc, value) => acc + value - 1, 0) < character().leveling.subclass && newClass()) {
      const subclassSlug = character().subclasses[newClass()];
      payload = {
        ...payload,
        subclasses_mastery: {
          ...character().subclasses_mastery, [subclassSlug]: character().subclasses_mastery[subclassSlug] + 1
        }
      }
    }

    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartLevelingV2' }}>
      <GuideWrapper
        character={character()}
        guideStep={props.guideStep}
        helpMessage={props.helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={props.finishGuideStep}
      >
        <div class="character-info-block">
          <LevelUp character={character()} levelUp={levelUp}>
            <p>{i18n().currentLevel} - {character().level}</p>
          </LevelUp>
          <Show when={levelingData() && character().level > 1}>
            <p class="mt-4 mb-2">{i18n()['title']} - {levelPoints() - spendLevelPoints()}</p>
            <For
              each={[
                { css: 'mt-4 mb-2', title: i18n()['traits'], amount: 3, attribute: 'traits' },
                { css: 'mb-2', title: i18n()['health'], amount: 2, attribute: 'health' },
                { css: 'mb-2', title: i18n()['stress'], amount: 2, attribute: 'stress' },
                { css: 'mb-2', title: i18n()['experience'], amount: 1, attribute: 'experience' },
                { css: 'mb-2', title: i18n()['domainCards'], amount: 1, attribute: 'domain_cards' },
                { css: 'mb-2', title: i18n()['evasion'], amount: 1, attribute: 'evasion' }
              ]}
            >
              {(item) =>
                <Show when={levelingData()[item.attribute] > 0 || levelPoints() > 0}>
                  <div class={item.css}>
                    <p class="text-sm/4 uppercase mb-1">{item.title}</p>
                    <div class="flex">
                      <For each={Array.from([...Array((item.attribute === 'traits' ? 1 : (character().tier - 1)) * item.amount).keys()], (x) => x + 1)}>
                        {(index) =>
                          <Show
                            when={item.attribute !== 'traits'}
                            fallback={
                              <Checkbox
                                filled
                                checked={levelingData().traits[character().tier] >= index}
                                classList="mr-1"
                                onToggle={() => updateLeveling(item.attribute, index)}
                              />
                            }
                          >
                            <Checkbox
                              filled
                              checked={levelingData()[item.attribute] >= index}
                              classList="mr-1"
                              onToggle={() => updateLeveling(item.attribute, index)}
                            />
                          </Show>
                        }
                      </For>
                    </div>
                  </div>
                </Show>
              }
            </For>
            <Show when={character().tier > 2}>
              <For
                each={[
                  { title: i18n()['proficiency'], amount: character().tier - 2, attribute: 'proficiency', changeable: true },
                  { title: i18n()['subclass'], amount: character().tier - 2 - levelingData().multiclass, attribute: 'subclass', changeable: Object.values(character().subclasses_mastery).filter((item) => item > 1).reduce((acc, value) => acc + value - 1, 0) !== character().leveling.subclass },
                  { title: i18n()['multiclass'], amount: character().tier - 2 - levelingData().subclass, attribute: 'multiclass', changeable: Object.keys(character().classes).length !== levelingData().multiclass + 1 }
                ]}
              >
                {(item) =>
                  <Show when={item.amount > 0}>
                    <div class="mb-2">
                      <p class="text-sm/4 uppercase mb-1">{item.title}</p>
                      <div class="flex">
                        <For each={Array.from([...Array(item.amount).keys()], (x) => x + 1)}>
                          {(index) =>
                            <Checkbox
                              filled
                              checked={levelingData()[item.attribute] >= index}
                              classList="mr-1"
                              onToggle={() => levelingData()[item.attribute] < index || item.changeable ? updateLeveling(item.attribute, index) : null}
                            />
                          }
                        </For>
                      </div>
                    </div>
                  </Show>
                }
              </For>
            </Show>
            <Show when={character().leveling.traits[character().tier] > 0}>
              <Select
                multi
                containerClassList="w-full mb-2"
                labelText={i18n()['traitsSelect']}
                items={translate(config.traits, currentLocale())}
                selectedValues={levelingData().selected_traits[character().tier]}
                onSelect={selectTrait}
              />
            </Show>
            <Show when={Object.keys(character().classes).length <= character().leveling.multiclass}>
              <Select
                containerClassList="w-full mb-2"
                labelText={i18n()['classSelect']}
                items={translate(daggerheartClasses(), currentLocale())}
                selectedValue={newClass()}
                onSelect={setNewClass}
              />
              <Show when={newClass()}>
                <Select
                  containerClassList="w-full mb-2"
                  labelText={i18n()['subclassSelect']}
                  items={translate(daggerheartClasses()[newClass()].subclasses, currentLocale())}
                  selectedValue={newSubclass()}
                  onSelect={setNewSubclass}
                />
                <Select
                  containerClassList="w-full mb-2"
                  labelText={i18n()['selectDomain']}
                  items={Object.fromEntries(Object.entries(classDomains()).filter(([key,]) => daggerheartClasses()[newClass()].domains.includes(key)))}
                  selectedValue={domainsData()[newClass()]}
                  onSelect={(value) => selectDomain(newClass(), value)}
                />
              </Show>
              <p class="text-sm mb-4">{i18n().multiclassTooltip}</p>
            </Show>
            <Show when={Object.values(character().subclasses_mastery).filter((item) => item > 1).reduce((acc, value) => acc + value - 1, 0) < character().leveling.subclass}>
              <Select
                containerClassList="w-full mb-2"
                labelText={i18n()['subclassMasterySelect']}
                items={translate(existingClasses(), locale())}
                selectedValue={newClass()}
                onSelect={setNewClass}
              />
              <p class="text-sm mb-4">{i18n().subclassTooltip}</p>
            </Show>
            <div class="flex mt-2 gap-x-4">
              <Button default textable classList="flex-1" onClick={updateClasses}>{i18n()['save']}</Button>
            </div>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
