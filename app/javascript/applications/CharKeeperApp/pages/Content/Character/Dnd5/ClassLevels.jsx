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
import { translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    talents: 'Feats',
    existingTalentPoints: 'Available feats',
    selectTalent: 'Select new feat',
    saveButton: 'Save',
    selectedTalents: 'Selected feats'
  },
  ru: {
    talents: 'Черты',
    existingTalentPoints: 'Доступно черт',
    selectTalent: 'Выберите новую черту',
    saveButton: 'Сохранить',
    selectedTalents: 'Выбранные черты'
  }
}

export const Dnd5ClassLevels = (props) => {
  const character = () => props.character;
  const currentConfig = () => character().provider === 'dnd5' ? dnd5Config : dnd2024Config;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
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
          batch(() => {
            setTalents(talentsData.talents);
          });
        }
      );
    }

    batch(() => {
      setClassesData(character().classes);
      setSubclassesData(character().subclasses);
      setLastActiveCharacterId(character().id);
    });
  });

  const availableTalents = createMemo(() => {
    if (talents() === undefined) return {};

    return talents().filter((item) => item.multiple || !item.selected).reduce((acc, item) => { acc[item.id] = item.title; return acc }, {});
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
      { character: { classes: classesData(), subclasses: subclassesData() } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        renderNotice(t('alerts.characterIsUpdated'));
      });
    } else renderAlerts(result.errors_list);
  }

  const saveTalent = async () => {
    const result = await createTalentRequest(appState.accessToken, character().provider, character().id, { talent_id: selectedTalent().id });

    if (result.errors_list === undefined) {
      props.onReloadCharacter();
      setSelectedTalent(null);
    }
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
            <p class="dark:text-snow">{character().subclasses[character().main_class] ? `${classes()[character().main_class]} - ${translate(currentConfig().classes[character().main_class].subclasses, locale())[character().subclasses[character().main_class]]}` : classes()[character().main_class]}</p>
            <div class="my-2 flex items-center">
              <div class="flex justify-between items-center mr-4 w-24">
                <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'down')}>
                  <Minus />
                </Button>
                <p class="dark:text-snow">{classesData()[character().main_class]}</p>
                <Button default size="small" onClick={() => changeClassLevel(character().main_class, 'up')}>
                  <PlusSmall />
                </Button>
              </div>
              <div class="flex-1">
                <Show
                  when={Object.keys(currentConfig().classes[character().main_class].subclasses).length > 0 && !character().subclasses[character().main_class]}
                  fallback={<></>}
                >
                  <Select
                    containerClassList="w-full"
                    items={translate(currentConfig().classes[character().main_class].subclasses, locale())}
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
                  labelText={character().subclasses[slug] ? `${className} - ${translate(currentConfig().classes[slug].subclasses, locale())[character().subclasses[slug]]}` : className}
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
                        <p class="dark:text-snow">{classesData()[slug]}</p>
                        <Button default size="small" onClick={() => changeClassLevel(slug, 'up')}>
                          <PlusSmall />
                        </Button>
                      </div>
                      <div class="flex-1">
                        <Show
                          when={Object.keys(currentConfig().classes[slug].subclasses).length > 0 && !character().subclasses[slug]}
                          fallback={<></>}
                        >
                          <Select
                            containerClassList="w-full"
                            items={translate(currentConfig().classes[slug].subclasses, locale())}
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
                <p>{TRANSLATION[locale()].talents}</p>
                <p>{TRANSLATION[locale()].existingTalentPoints} - {1 + Math.trunc(character().level / 4) - Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0)}</p>
              </div>
            }
          >
            <Show when={talents()}>
              <p class="text-sm mb-2">{TRANSLATION[locale()].selectedTalents}</p>
              <For each={Object.entries(character().selected_talents)}>
                {([id, amount]) =>
                  <p class="text-lg">{talents().find((item) => item.id === id).title}{amount > 1 ? ` - ${amount}` : ''}</p>
                }
              </For>
              <div class="mb-2" />
            </Show>
            <Show when={1 + Math.trunc(character().level / 4) > Object.values(character().selected_talents).reduce((acc, value) => acc + value, 0)}>
              <Select
                labelText={TRANSLATION[locale()].selectTalent}
                containerClassList="flex-1"
                items={availableTalents()}
                selectedValue={selectedTalent()?.id}
                onSelect={(value) => setSelectedTalent(talents().find((item) => item.id === value))}
              />
              <Show when={selectedTalent()}>
                <p
                  class="feat-markdown text-xs mt-1"
                  innerHTML={selectedTalent().description} // eslint-disable-line solid/no-innerhtml
                />
                <Button default textable size="small" classList="inline-block mt-2" onClick={saveTalent}>
                  {TRANSLATION[locale()].saveButton}
                </Button>
              </Show>
            </Show>
          </Toggle>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
