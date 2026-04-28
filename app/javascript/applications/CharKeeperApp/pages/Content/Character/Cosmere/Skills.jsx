import { createEffect, createSignal, createMemo, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, Levelbox, Input, EditWrapper, Button, Select, Dice } from '../../../../components';
import config from '../../../../data/cosmere.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    skills: 'Skills',
    skillBoosts: 'You have skill points to spend',
    add: 'Add skill'
  },
  ru: {
    skills: 'Навыки',
    skillBoosts: 'У вас есть очки навыков для распределения',
    add: 'Добавить навык'
  },
  es: {
    skills: 'Habilidades',
    skillBoosts: 'Tienes puntos de habilidad para gastar',
    add: 'Agregar habilidad'
  }
}

export const CosmereSkills = (props) => {
  const character = () => props.character;

  const [lastTimestamp, setLastTimestamp] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [loresData, setLoresData] = createSignal(character().additional_skills);
  const [skillPoints, setSkillPoints] = createSignal(character().skill_points);

  const [newSkill, setNewSkill] = createSignal('');
  const [newSkillAbility, setNewSkillAbility] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastTimestamp() === character().updated_at) return;

    batch(() => {
      setSkillsData(character().skills);
      setSkillPoints(character().skill_points)
      setLoresData(character().additional_skills);
      setEditMode(character().guide_step === 2);
    });

    setLastTimestamp(character().updated_at);
  });

  const maxSkillLevel = createMemo(() => Math.min(5, character().tier + 1));

  const updateSkill = (slug, modifier) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, level: item.level + modifier } 
    });
    batch(() => {
      setSkillPoints(skillPoints() - modifier);
      setSkillsData(result);
    });
  }

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const changeLoreSkill = (slug, value) => {
    setLoresData({ ...loresData(), [slug]: { ...loresData()[slug], name: value } });
  }

  const saveNewSkill = () => {
    if (newSkill().length === 0) return;
    if (!newSkillAbility()) return;

    const id = Math.floor(Math.random() * 1000000).toString();
    batch(() => {
      setSkillsData(skillsData().concat({ slug: id, ability: newSkillAbility(), level: 0 }));
      setLoresData({ ...loresData(), [id]: { name: newSkill(), ability: newSkillAbility() } });
      setNewSkill('');
      setNewSkillAbility(null);
    });
  }

  const updateCharacter = async () => {
    const payload = {
      selected_skills: skillsData()
        .filter((item) => item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {}),
      additional_skills: loresData(),
      skill_points: skillPoints()
    }
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereSkills' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4 pb-8">
          <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
          <Show when={character().skill_points !== 0}>
            <div class="mt-2">
              <div class="warning mb-4">
                <p class="text-sm text-black!">
                  {localize(TRANSLATION, locale()).skillBoosts} - {skillPoints()}
                </p>
              </div>
            </div>
          </Show>
          <div class="fallout-skills">
            <For each={Object.keys(config.abilities)}>
              {(slug) =>
                <Show
                  when={editMode()}
                  fallback={
                    <For each={character().skills.filter((item) => item.ability === slug)}>
                      {(skill) =>
                        <div class="fallout-skill">
                          <Levelbox classList="mr-2" value={skill.level} />
                          <p class="uppercase mr-4">{skill.ability}</p>
                          <p class={`flex-1 flex items-center ${skill.level > 0 ? 'font-medium!' : ''}`}>
                            {config.skills[skill.slug] ? localize(config.skills[skill.slug].name, locale()) : character().additional_skills[skill.slug].name}
                          </p>
                          <Dice
                            width="28"
                            height="28"
                            text={modifier(skill.modifier)}
                            onClick={() => props.openCosmereTest(`/check skill "${skill.slug}"`, null, skill.modifier)}
                          />
                        </div>
                      }
                    </For>
                  }
                >
                  <Key each={skillsData().filter((item) => item.ability === slug)} by={item => item.slug}>
                    {(skill) =>
                      <div class="fallout-skill">
                        <p class={`flex-1 flex items-center ${skill().level > 0 ? 'font-medium!' : ''}`}>
                          <Show
                            when={loresData()[skill().slug]}
                            fallback={localize(config.skills[skill().slug].name, locale())}
                          >
                            <Input
                              value={loresData()[skill().slug].name}
                              onInput={(value) => changeLoreSkill(skill().slug, value)}
                            />
                          </Show>
                        </p>
                        <div class="fallout-skill-actions">
                          <Button
                            default
                            size="small"
                            disabled={skill().level === 0}
                            onClick={() => updateSkill(skill().slug, -1)}
                          ><Minus /></Button>
                          <p>{skill().level}</p>
                          <Button
                            default
                            size="small"
                            disabled={skill().level >= maxSkillLevel()}
                            onClick={() => updateSkill(skill().slug, 1)}
                          ><Plus /></Button>
                        </div>
                      </div>
                    }
                  </Key>
                </Show>
              }
            </For>
            <Show when={editMode()}>
              <div class="flex flex-row items-center gap-x-2 mt-4">
                <Input containerClassList="flex-1" value={newSkill()} onInput={setNewSkill} />
                <Select
                  containerClassList="flex-1"
                  items={translate(config.abilities, locale())}
                  selectedValue={newSkillAbility()}
                  onSelect={setNewSkillAbility}
                />
                <Button default textable onClick={saveNewSkill}>{localize(TRANSLATION, locale()).add}</Button>
              </div>
            </Show>
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
