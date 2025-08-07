import { createMemo, createSignal, createEffect, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, Checkbox, Button, ErrorWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchHomebrewsRequest } from '../../../../requests/fetchHomebrewsRequest';
import { translate } from '../../../../helpers';

export const DaggerheartLeveling = (props) => {
  const character = () => props.character;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [classesData, setClassesData] = createSignal(character().classes);
  const [subclassesData, setSubclassesData] = createSignal(character().subclasses);
  const [domainsData, setDomainsData] = createSignal(character().domains);
  const [subclassesMasteryData, setSubclassesMasteryData] = createSignal(character().subclasses_mastery);
  const [levelingData, setLevelingData] = createSignal(character().leveling);
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts, renderAlert }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setClassesData(character().classes);
      setSubclassesData(character().subclasses);
      setDomainsData(character().domains);
      setSubclassesMasteryData(character().subclasses_mastery);
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
  });

  const daggerheartClasses = createMemo(() => {
    if (homebrews() === undefined) return {};

    const defaultClasses = Object.fromEntries(Object.entries(config.classes).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};
      const allSubclasses = { ...values.subclasses, ...homebrewSubclasses };

      return [slug, { ...values, subclasses: allSubclasses }];
    }));

    const homebrewClasses = Object.fromEntries(Object.entries(homebrews().daggerheart.classes).map(([slug, values]) => {
      const homebrewSubclasses = homebrews().daggerheart.subclasses[slug] || {};

      return [slug, { ...values, subclasses: homebrewSubclasses }];
    }));

    return { ...defaultClasses, ...homebrewClasses };
  });

  const sortedClasses = createMemo(() => {
    const result = [{ [character().main_class]: daggerheartClasses()[character().main_class]}];

    Object.keys(character().classes).forEach((slug) => {
      if (slug !== character().main_class) result.push({ [slug]: daggerheartClasses()[slug] });
    })

    Object.entries(daggerheartClasses()).filter(([slug,]) => {
      return !character().classes[slug];
    }).forEach((item) => {
      result.push({ [item[0]]: item[1] });
    })

    return result;
  });

  const classDomains = createMemo(() => translate(config.domains, locale()));

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

      const masteryResult = Object.keys(subclassesMasteryData())
        .filter(item => item !== className)
        .reduce((acc, item) => { acc[item] = subclassesMasteryData()[item]; return acc; }, {} );

      batch(() => {
        setClassesData(classesResult);
        setSubclassesData(subclassesResult);
        setSubclassesMasteryData(masteryResult);
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

  const changeMastery = (subclassName, direction) => {
    if (direction === 'down' && subclassesMasteryData()[subclassName] === 1) return;
    if (direction === 'up' && subclassesMasteryData()[subclassName] === 3) return;

    const newValue = direction === 'up' ? (subclassesMasteryData()[subclassName] + 1) : (subclassesMasteryData()[subclassName] - 1);
    setSubclassesMasteryData({ ...subclassesMasteryData(), [subclassName]: newValue });
  }

  const selectSubclass = (classSlug, value) => {
    batch(() => {
      setSubclassesData({ ...subclassesData(), [classSlug]: value });
      setSubclassesMasteryData({ ...subclassesMasteryData(), [value]: 1 });
    });
  }

  const selectDomain = (classSlug, value) => setDomainsData({ ...domainsData(), [classSlug]: value });

  const updateLeveling = async (key, value) => {
    const newValue = levelingData()[key] === value ? (value - 1) : value;
    setLevelingData({ ...levelingData(), [key]: newValue });
  }

  const updateClasses = async () => {
    if (Object.keys(classesData()).length !== Object.values(subclassesData()).filter((item) => item).length) {
      return renderAlert(t('alerts.invalidSubclassesList'));
    }

    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      {
        character: {
          classes: classesData(),
          subclasses: subclassesData(),
          subclasses_mastery: subclassesMasteryData(),
          leveling: levelingData(),
          domains: domainsData()
        }
      }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        renderNotice(t('alerts.characterIsUpdated'));
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartLeveling' }}>
      <div class="blockable p-4 flex flex-col">
        <Show when={Object.keys(daggerheartClasses()).length > 0}>
          <For each={sortedClasses()}>
            {(classDataElement) =>
              <For each={Object.entries(classDataElement)}>
                {([classSlug, classData]) =>
                  <div class="mb-2">
                    <Show
                      when={classSlug !== character().main_class}
                      fallback={
                        <p class="dark:text-snow">{character().subclasses[character().main_class] ? `${daggerheartClasses()[character().main_class].name[locale()]} - ${daggerheartClasses()[character().main_class].subclasses[character().subclasses[character().main_class]].name[locale()]}` : daggerheartClasses()[character().main_class].name[locale()]}</p>
                      }
                    >
                      <Checkbox
                        labelText={character().subclasses[classSlug] ? `${classData.name[locale()]} - ${daggerheartClasses()[classSlug].subclasses[character().subclasses[classSlug]].name[locale()]}` : classData.name[locale()]}
                        labelPosition="right"
                        labelClassList="ml-4 cursor-pointer"
                        checked={classesData()[classSlug]}
                        onToggle={() => toggleClass(classSlug)}
                      />
                    </Show>
                    <Show when={classesData()[classSlug]}>
                      <div class="flex mt-2">
                        <div>
                          <div class="flex items-center">
                            <Button default size="small" onClick={() => changeClassLevel(classSlug, 'down')}>
                              <Minus />
                            </Button>
                            <p class="w-10 text-center dark:text-snow">{classesData()[classSlug]}</p>
                            <Button default size="small" onClick={() => changeClassLevel(classSlug, 'up')}>
                              <PlusSmall />
                            </Button>
                          </div>
                          <span class="text-xs dark:text-snow">{t('daggerheart.leveling.level')}</span>
                        </div>
                        <Show when={classesData()[classSlug] && character().subclasses[classSlug]}>
                          <div class="ml-8">
                            <div class="flex items-center">
                              <Button default size="small" onClick={() => changeMastery(character().subclasses[classSlug], 'down')}>
                                <Minus />
                              </Button>
                              <p class="w-10 text-center dark:text-snow">{subclassesMasteryData()[character().subclasses[classSlug]]}</p>
                              <Button default size="small" onClick={() => changeMastery(character().subclasses[classSlug], 'up')}>
                                <PlusSmall />
                              </Button>
                            </div>
                            <span class="text-xs dark:text-snow">{t('daggerheart.leveling.mastery')}</span>
                          </div>
                        </Show>
                      </div>
                    </Show>
                    <Show when={classesData()[classSlug]}>
                      <Show when={classSlug !== character().main_class && !character().domains[classSlug]}>
                        <Select
                          containerClassList="w-full"
                          labelText={t('daggerheart.leveling.domain')}
                          items={Object.fromEntries(Object.entries(classDomains()).filter(([key,]) => daggerheartClasses()[classSlug].domains.includes(key)))}
                          selectedValue={domainsData()[classSlug]}
                          onSelect={(value) => selectDomain(classSlug, value)}
                        />
                      </Show>
                      <Show when={!character().subclasses[classSlug]}>
                        <Select
                          containerClassList="w-full"
                          labelText={t('daggerheart.leveling.subclass')}
                          items={translate(daggerheartClasses()[classSlug].subclasses, locale())}
                          selectedValue={subclassesData()[classSlug]}
                          onSelect={(value) => selectSubclass(classSlug, value)}
                        />
                      </Show>
                    </Show>
                  </div>
                }
              </For>
            }
          </For>
          <Show when={character().tier > 1}>
            <For
              each={[
                { css: 'mt-4 mb-2', title: t('daggerheart.leveling.health'), coef: 2, attribute: 'health' },
                { css: 'mb-2', title: t('daggerheart.leveling.stress'), coef: 2, attribute: 'stress' },
                { css: 'mb-2', title: t('daggerheart.leveling.evasion'), coef: 1, attribute: 'evasion' },
                { css: 'mb-2', title: t('daggerheart.leveling.domainCards'), coef: 1, attribute: 'domain_cards' }
              ]}
            >
              {(item) =>
                <div class={item.css}>
                  <p class="text-sm/4 uppercase mb-1 dark:text-snow">{item.title}</p>
                  <div class="flex">
                    <For each={Array.from([...Array((character().tier - 1) * item.coef).keys()], (x) => x + 1)}>
                      {(index) =>
                        <Checkbox
                          filled
                          checked={levelingData()[item.attribute] >= index}
                          classList="mr-1"
                          onToggle={() => updateLeveling(item.attribute, index)}
                        />
                      }
                    </For>
                  </div>
                </div>
              }
            </For>
            <Show when={character().tier > 2}>
              <div class="mb-2">
                <p class="text-sm/4 uppercase mb-1 dark:text-snow">{t('daggerheart.leveling.proficiency')}</p>
                <div class="flex">
                  <For each={Array.from([...Array(character().tier - 2).keys()], (x) => x + 1)}>
                    {(index) =>
                      <Checkbox
                        filled
                        checked={levelingData().proficiency >= index}
                        classList="mr-1"
                        onToggle={() => updateLeveling('proficiency', index)}
                      />
                    }
                  </For>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
        <Button default textable classList="mt-2" onClick={updateClasses}>{t('save')}</Button>
      </div>
    </ErrorWrapper>
  );
}
