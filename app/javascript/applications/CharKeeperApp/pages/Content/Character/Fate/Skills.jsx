import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, Label, Dice, Button, Input, Select } from '../../../../components';
import { useAppState, useAppAlert, useAppLocale } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Skills',
    ladder: {
      superb: 'Superb',
      great: 'Great',
      good: 'Good',
      fair: 'Fair',
      average: 'Average'
    },
    check: 'Skill',
    add: 'Add',
    skillMode: 'Skills mode',
    modes: {
      core: 'Core',
      approaches: 'Approaches'
    }
  },
  ru: {
    title: 'Навыки',
    ladder: {
      superb: 'Великолепный',
      great: 'Отличный',
      good: 'Хороший',
      fair: 'Неплохой',
      average: 'Средний'
    },
    check: 'Навык',
    add: 'Добавить',
    skillMode: 'Режим навыков',
    modes: {
      core: 'Базовый',
      approaches: 'Подходы'
    }
  },
  es: {
    title: 'Habilidades',
    ladder: {
      superb: 'Magnífico',
      great: 'Excelente',
      good: 'Bueno',
      fair: 'Regular',
      average: 'Promedio'
    },
    check: 'Habilidad',
    add: 'Agregar',
    skillMode: 'Skills mode',
    modes: {
      core: 'Core',
      approaches: 'Approaches'
    }
  }
}

export const FateSkills = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [approachesData, setApproachesData] = createSignal(character().approaches);
  const [additionalSkills, setAdditionalSkills] = createSignal(character().additional_skills);

  const [editMode, setEditMode] = createSignal(false);
  const [newSkill, setNewSkill] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setSkillsData(character().skills);
      setApproachesData(character().approaches);
      setAdditionalSkills(character().additional_skills);
      setLastActiveCharacterId(character().id);
    });
  });

  const saveNewSkill = () => {
    if (newSkill().length === 0) return;

    const id = Math.floor(Math.random() * 1000000).toString();
    batch(() => {
      setSkillsData(skillsData().concat({ slug: id, name: newSkill(), level: 0 }));
      setAdditionalSkills({ ...additionalSkills(), [id]: { name: newSkill() } });
      setNewSkill('');
    });
  }

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const updateSkill = (slug, modifier) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, level: item.level + modifier } 
    });
    setSkillsData(result);
  }

  const updateApproach = (slug, modifier) => {
    const result = approachesData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, level: item.level + modifier } 
    });
    setApproachesData(result);
  }

  const updateCharacter = () => {
    const payload = {
      selected_skills: skillsData()
        .filter((item) => item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {}),
      selected_approaches: approachesData()
        .filter((item) => item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {}),
      additional_skills: additionalSkills()
    }

    sendUpdateCharacter(payload);
    setEditMode(false);
  }

  const sendUpdateCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FateSkills' }}>
      <EditWrapper
        position="right"
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4">
          <h2 class="text-lg">{localize(TRANSLATION, locale()).title}</h2>
          <Show
            when={editMode()}
            fallback={
              <Show
                when={character().skills_system === 'core'}
                fallback={
                  <div class="fallout-skills">
                    <For each={character().approaches.sort((a, b) => a.level > b.level)}>
                      {(skill) =>
                        <div class="fallout-skill">
                          <p class="flex-1 flex items-center">{skill.name}</p>
                          <Dice
                            width="28"
                            height="28"
                            text={modifier(skill.level)}
                            onClick={() => props.openDiceRoll(`/check skill "${skill.name}"`, skill.level, `${localize(TRANSLATION, locale()).check}, ${skill.name}`)}
                          />
                        </div>
                      }
                    </For>
                  </div>
                }
              >
                <For each={[[5, 'superb'], [4, 'great'], [3, 'good'], [2, 'fair'], [1, 'average']]}>
                  {([level, ladder]) =>
                    <div class="mt-2">
                      <Label labelText={localize(TRANSLATION, locale()).ladder[ladder]} labelClassList="text-xs!" />
                      <div class="flex items-center gap-x-2 flex-wrap mt-1">
                        <For each={character().skills.filter((skill) => skill.level === parseInt(level))}>
                          {(skill) =>
                            <p class="flex items-center gap-x-2 p-2">
                              {skill.name}
                              <Dice
                                width="30"
                                height="30"
                                text={modifier(skill.level)}
                                onClick={() => props.openDiceRoll(`/check skill "${skill.name}"`, skill.level, `${localize(TRANSLATION, locale()).check}, ${skill.name}`)}
                              />
                            </p>
                          }
                        </For>
                      </div>
                    </div>
                  }
                </For>
              </Show>
            }
          >
            <Select
              containerClassList="mb-4"
              labelText={localize(TRANSLATION, locale()).skillMode}
              items={localize(TRANSLATION, locale()).modes}
              selectedValue={character().skills_system}
              onSelect={(value) => sendUpdateCharacter({ skills_system: value })}
            />
            <div class="fallout-skills">
              <Show
                when={character().skills_system === 'core'}
                fallback={
                  <For each={approachesData().sort((a, b) => a.name > b.name)}>
                    {(skill) =>
                      <div class="fallout-skill gap-2">
                        <p class="flex-1 text-sm">{skill.name}</p>
                        <div class="fallout-skill-actions">
                          <Button default size="small" disabled={skill.level === 0} onClick={() => updateApproach(skill.slug, -1)} ><Minus /></Button>
                          <p>{skill.level}</p>
                          <Button default size="small" disabled={skill.level >= 3} onClick={() => updateApproach(skill.slug, 1)} ><Plus /></Button>
                        </div>
                      </div>
                    }
                  </For>
                }
              >
                <For each={skillsData().sort((a, b) => a.name > b.name)}>
                  {(skill) =>
                    <div class="fallout-skill gap-2">
                      <p class="flex-1 text-sm">{skill.name}</p>
                      <div class="fallout-skill-actions">
                        <Button default size="small" disabled={skill.level === 0} onClick={() => updateSkill(skill.slug, -1)} ><Minus /></Button>
                        <p>{skill.level}</p>
                        <Button default size="small" disabled={skill.level >= 5} onClick={() => updateSkill(skill.slug, 1)} ><Plus /></Button>
                      </div>
                    </div>
                  }
                </For>
                <div class="flex flex-row items-center gap-x-2">
                  <Input containerClassList="flex-1" value={newSkill()} onInput={setNewSkill} />
                  <Button default textable onClick={saveNewSkill}><span>{localize(TRANSLATION, locale()).add}</span></Button>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
