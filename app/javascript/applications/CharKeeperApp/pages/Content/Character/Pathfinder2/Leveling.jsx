import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Button, ErrorWrapper, Toggle, Select, createModal, Text, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Upgrade, Check } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { fetchTalentsRequest } from '../../../../requests/fetchTalentsRequest';
import { createTalentRequest } from '../../../../requests/createTalentRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    currentLevel: 'level',
    saveButton: 'Save',
    updated: 'Character is updated',
    ancestryFeat: 'Ancestry feat',
    classFeat: 'Class feat',
    skillFeat: 'Skill feat',
    generalFeat: 'General feat',
    newFeat: 'Choose feat',
    confirm: 'Confirm feat selection',
    notSelected: 'Not selected',
    selectTags: 'Select tags',
    additionalFeat: 'Additional feat',
    experience: 'Experience'
  },
  ru: {
    currentLevel: 'уровень',
    saveButton: 'Сохранить',
    updated: 'Персонаж обновлён',
    ancestryFeat: 'Черта народа',
    classFeat: 'Классовая черта',
    skillFeat: 'Черта навыка',
    generalFeat: 'Общая черта',
    newFeat: 'Выберите черту',
    confirm: 'Подтвердить выбор черты',
    notSelected: 'Не выбрана',
    selectTags: 'Выбрать тэги',
    additionalFeat: 'Дополнительная черта',
    experience: 'Опыт'
  }
}

const ANCESTRY_FEAT_LEVELS = [1, 5, 9, 13, 17];
const CLASS_FEAT_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const GENERAL_FEAT_LEVELS = [3, 7, 11, 15, 19];
const SKILL_FEAT_LEVELS = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];
const ADDITIONAL_SKILL_CLASSES = ['fighter', 'rogue', 'ranger'];

export const Pathfinder2Leveling = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [feats, setFeats] = createSignal(undefined);
  const [selectedFeats, setSelectedFeats] = createSignal([]);
  const [tags, setTags] = createSignal(undefined);

  const [featFilter, setFeatFilter] = createSignal(null);
  const [selectedFeat, setSelectedFeat] = createSignal(null);
  const [selectedTags, setSelectedTags] = createSignal([]);
  const [experience, setExperience] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const { Modal, openModal, closeModal } = createModal();
  const [locale] = useAppLocale();

  const fetchTalents = async () => await fetchTalentsRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchTalents()]).then(
      ([talentsData]) => {
        batch(() => {
          setTags(Object.fromEntries(Object.entries(talentsData.tags).sort(([, a], [, b]) => a.localeCompare(b))));
          setFeats(talentsData.feats);
          setSelectedFeats(talentsData.character_feats);
          setExperience(character().experience)
        });
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const selectedFeatIds = createMemo(() => selectedFeats().map((item) => item.feat.id));

  const availableFeats = createMemo(() => {
    if (!feats()) return {};
    if (!featFilter()) return {};

    const checkTags = (featFilter().type === 'ancestry' || featFilter().type === 'class') && selectedTags().length > 0;

    return Object.fromEntries(
      feats().filter((item) => {
        if (!item.info.multiple && selectedFeatIds().includes(item.id)) return false;
        if (item.conditions.level > featFilter().level) return false;
        if (item.conditions.selected_feature) return false;
        if (featFilter().type === 'skill' && !item.origin_values.includes('skill')) return false;
        if (featFilter().type === 'general' && !item.origin_values.includes('general')) return false;
        if (checkTags && !item.origin_values.some(element => selectedTags().includes(element))) return false;

        return true;
      }).map((item) => [item.id, item.title])
    );
  })

  const selectFeat = (type, level) => {
    batch(() => {
      setFeatFilter({ type: type, level: level });
      if (type === 'class') setSelectedTags([character().main_class]);
      if (type === 'ancestry') setSelectedTags([character().race]);
      if (type === 'skill') setSelectedTags(['skill']);
      if (type === 'general') setSelectedTags(['general']);
      openModal();
    });
  }

  const findSelectedFeat = async (value) => setSelectedFeat(feats().find((item) => item.id === value));

  const changeSelectedTags = (value) => {
    batch(() => {
      if (selectedTags().includes(value)) setSelectedTags(selectedTags().filter((item) => item !== value));
      else setSelectedTags(selectedTags().concat(value));
      setSelectedFeat(null);
    });
  }

  const confirmSelectedFeat = async () => {
    const result = await createTalentRequest(
      appState.accessToken, character().provider, character().id, { feat: { id: selectedFeat().id, type: featFilter().type, level: featFilter().level } }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        batch(() => {
          setFeatFilter(null);
          setSelectedFeat(null);
        });
        closeModal();
        refetchSelectedFeats();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const refetchSelectedFeats = async () => {
    const result = await fetchTalents();
    performResponse(
      result,
      function() {
        setSelectedFeats(result.character_feats);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const changeExperience = () => {
    const value = parseInt(experience());
    if (!(value >= 0)) return;

    updateCharacter({ experience: value }, true);
  }

  const updateCharacter = async (payload, onlyHead = false) => {
    const requestPayload = { character: payload, only_head: onlyHead }
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, requestPayload);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(onlyHead ? payload : result.character);
        renderNotice(localize(TRANSLATION, locale()).updated)
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const renderSelectedFeatValue = (type, level) => {
    const value = selectedFeats().find((item) => item.type === type && item.level === level);
    return (
      <Text
        containerClassList={`${value ? '' : 'cursor-pointer'}`}
        labelText={renderFeatLabel(type)}
        text={value ? value.feat.title : localize(TRANSLATION, locale()).notSelected}
        textClassList="text-lg"
        onClick={() => value ? null : selectFeat(type, level)}
      />
    );
  }

  const renderAdditionalFeatValues = (level) => {
    const values = selectedFeats().filter((item) => item.type === 'additional' && item.level === level);
    return (
      <>
        <For each={values}>
          {(value) =>
            <div>
              <Text
                labelText={renderFeatLabel('additional')}
                text={value.feat.title}
                textClassList="text-lg"
              />
            </div>
          }
        </For>
        <Text
          containerClassList="cursor-pointer"
          labelText={renderFeatLabel('additional')}
          text={localize(TRANSLATION, locale()).notSelected}
          textClassList="text-lg"
          onClick={() => selectFeat('additional', level)}
        />
      </>
    );
  }

  const renderFeatLabel = (type) => {
    if (type === 'ancestry') return localize(TRANSLATION, locale()).ancestryFeat;
    if (type === 'class') return localize(TRANSLATION, locale()).classFeat;
    if (type === 'skill') return localize(TRANSLATION, locale()).skillFeat;
    if (type === 'general') return localize(TRANSLATION, locale()).generalFeat;
    if (type === 'additional') return localize(TRANSLATION, locale()).additionalFeat;
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Leveling' }}>
      <div class="blockable py-4 px-2 md:px-4 mb-2 flex flex-col md:flex-row md:justify-between md:items-center gap-y-2">
        <div class="flex items-center">
          <Button default classList="rounded mr-4" onClick={() => updateCharacter({ level: character().level + 1 })}>
            <Upgrade width="24" height="24" />
          </Button>
          <p>{character().level} {localize(TRANSLATION, locale()).currentLevel}</p>
        </div>
        <div class="flex justify-between items-end gap-2">
          <Input
            numeric
            containerClassList="flex-1"
            labelText={localize(TRANSLATION, locale()).experience}
            value={experience()}
            onInput={setExperience}
          />
          <Button default onClick={changeExperience}><Check width="20" height="20" /></Button>
        </div>
      </div>
      <For each={Array.from([...Array(character().level).keys()], (x) => x + 1)}>
        {(index) =>
          <Toggle title={`${index} ${localize(TRANSLATION, locale()).currentLevel}`}>
            <div class="flex flex-col gap-y-4">
              <Show when={ANCESTRY_FEAT_LEVELS.includes(index)}>
                {renderSelectedFeatValue('ancestry', index)}
              </Show>
              <Show when={CLASS_FEAT_LEVELS.includes(index) || index === 1 && ADDITIONAL_SKILL_CLASSES.includes(character().main_class)}>
                {renderSelectedFeatValue('class', index)}
              </Show>
              <Show when={GENERAL_FEAT_LEVELS.includes(index)}>
                {renderSelectedFeatValue('general', index)}
              </Show>
              <Show when={character().main_class === 'rogue' || SKILL_FEAT_LEVELS.includes(index)}>
                {renderSelectedFeatValue('skill', index)}
              </Show>
              {renderAdditionalFeatValues(index)}
            </div>
          </Toggle>
        }
      </For>
      <Modal classList="min-w-9/10 max-w-9/10 sm:min-w-2/3 sm:max-w-2/3! lg:min-w-1/3 lg:max-w-1/3!">
        <Show when={featFilter()}>
          <p>{localize(TRANSLATION, locale()).newFeat}</p>
          <Select
            multi
            searchable
            containerClassList="mt-4"
            labelText={localize(TRANSLATION, locale()).selectTags}
            items={tags()}
            selectedValues={selectedTags()}
            onSelect={changeSelectedTags}
          />
          <Show when={selectedTags().length > 0}>
            <div class="flex gap-2 flex-wrap mt-2">
              <For each={selectedTags()}>
                {(item) =>
                  <p class="tag text-sm">{tags()[item]}</p>
                }
              </For>
            </div>
          </Show>
          <Select
            searchable
            formDropdownClassList="relative!"
            labelText={renderFeatLabel(featFilter().type)}
            containerClassList="mt-4"
            items={availableFeats()}
            selectedValue={selectedFeat()?.id}
            onSelect={findSelectedFeat}
          />
          <Show when={selectedFeat()}>
            <div class="flex gap-2 flex-wrap mt-2">
              <For each={selectedFeat().origin_values}>
                {(item) =>
                  <p class="tag text-sm">{tags()[item]}</p>
                }
              </For>
            </div>
            <div
              class="feat-markdown mt-2"
              innerHTML={selectedFeat().description} // eslint-disable-line solid/no-innerhtml
            />
            <Button default classList="rounded mt-4" onClick={confirmSelectedFeat}>
              {localize(TRANSLATION, locale()).confirm}
            </Button>
          </Show>
        </Show>
      </Modal>
    </ErrorWrapper>
  );
}
