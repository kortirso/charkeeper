import { createMemo, createSignal, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, Checkbox, Button } from '../../../atoms';
import { ErrorWrapper } from '../../../molecules';

import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { translate } from '../../../../helpers';

export const DaggerheartLeveling = (props) => {
  const character = () => props.character;
  const classes = () => config.classes;

  // changeable data
  const [classesData, setClassesData] = createSignal(character().classes);
  const [subclassesData, setSubclassesData] = createSignal(character().subclasses);
  const [domainsData, setDomainsData] = createSignal(character().domains);
  const [subclassesMasteryData, setSubclassesMasteryData] = createSignal(character().subclasses_mastery);
  const [levelingData, setLevelingData] = createSignal(character().leveling);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts, renderAlert }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const sortedClasses = createMemo(() => {
    const result = [{ [character().main_class]: classes()[character().main_class]}];

    Object.keys(character().classes).forEach((slug) => {
      if (slug !== character().main_class) result.push({ [slug]: classes()[slug] });
    })

    Object.entries(classes()).filter(([slug,]) => {
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

  // submits
  const updateClasses = async () => {
    if (Object.keys(classesData()).length !== Object.values(subclassesData()).filter((item) => item).length) {
      return renderAlert(t('alerts.invalidSubclassesList'));
    }

    const result = await updateCharacterRequest(
      appState.accessToken,
      'daggerheart',
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
      <div class="white-box p-4 flex flex-col">
        <For each={sortedClasses()}>
          {(classDataElement) =>
            <For each={Object.entries(classDataElement)}>
              {([classSlug, classData]) =>
                <div class="mb-2">
                  <Show
                    when={classSlug !== character().main_class}
                    fallback={
                      <p>{character().subclasses[character().main_class] ? `${classes()[character().main_class].name[locale()]} - ${classes()[character().main_class].subclasses[character().subclasses[character().main_class]].name[locale()]}` : classes()[character().main_class].name[locale()]}</p>
                    }
                  >
                    <Checkbox
                      labelText={character().subclasses[classSlug] ? `${classData.name[locale()]} - ${classes()[classSlug].subclasses[character().subclasses[classSlug]].name[locale()]}` : classData.name[locale()]}
                      labelPosition="right"
                      labelClassList="ml-4"
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
                          <p class="w-10 text-center">{classesData()[classSlug]}</p>
                          <Button default size="small" onClick={() => changeClassLevel(classSlug, 'up')}>
                            <PlusSmall />
                          </Button>
                        </div>
                        <span class="font-cascadia-light text-xs">{t('daggerheart.leveling.level')}</span>
                      </div>
                      <Show when={classesData()[classSlug] && character().subclasses[classSlug]}>
                        <div class="ml-8">
                          <div class="flex items-center">
                            <Button default size="small" onClick={() => changeMastery(character().subclasses[classSlug], 'down')}>
                              <Minus />
                            </Button>
                            <p class="w-10 text-center">{subclassesMasteryData()[character().subclasses[classSlug]]}</p>
                            <Button default size="small" onClick={() => changeMastery(character().subclasses[classSlug], 'up')}>
                              <PlusSmall />
                            </Button>
                          </div>
                          <span class="font-cascadia-light text-xs">{t('daggerheart.leveling.mastery')}</span>
                        </div>
                      </Show>
                    </div>
                  </Show>
                  <Show when={classesData()[classSlug]}>
                    <Show when={classSlug !== character().main_class && !character().domains[classSlug]}>
                      <Select
                        containerClassList="w-full"
                        labelText={t('newCharacterPage.daggerheart.domain')}
                        items={Object.fromEntries(Object.entries(classDomains()).filter(([key,]) => classes()[classSlug].domains.includes(key)))}
                        selectedValue={domainsData()[classSlug]}
                        onSelect={(value) => selectDomain(classSlug, value)}
                      />
                    </Show>
                    <Show when={!character().subclasses[classSlug]}>
                      <Select
                        containerClassList="w-full"
                        labelText={t('newCharacterPage.daggerheart.subclass')}
                        items={Object.entries(classes()[classSlug].subclasses).reduce((acc, [key, values]) => { acc[key] = values.name[locale()]; return acc; }, {} )}
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
                <p class="text-sm/4 font-cascadia-light uppercase mb-1">{item.title}</p>
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
              <p class="text-sm/4 font-cascadia-light uppercase mb-1">{t('daggerheart.leveling.proficiency')}</p>
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
        <Button default textable classList="mt-2" onClick={updateClasses}>{t('save')}</Button>
      </div>
    </ErrorWrapper>
  );
}
