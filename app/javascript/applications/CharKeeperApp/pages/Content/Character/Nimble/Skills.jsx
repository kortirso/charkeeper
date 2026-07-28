import { createEffect, createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Levelbox, EditWrapper, Button, Dice } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    skills: 'Skills',
    skillBoosts: 'You have skill points to spend'
  },
  ru: {
    skills: 'Навыки',
    skillBoosts: 'У вас есть очки навыков для распределения'
  },
  es: {
    skills: 'Habilidades',
    skillBoosts: 'Tienes puntos de habilidad para gastar'
  }
}

export const NimbleSkills = (props) => {
  const character = () => props.character;

  const [lastTimestamp, setLastTimestamp] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [skillPoints, setSkillPoints] = createSignal(character().skill_points);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastTimestamp() === character().updated_at) return;

    batch(() => {
      setSkillsData(character().skills);
      setSkillPoints(character().skill_points);
      setEditMode(character().guide_step === 2);
    });

    setLastTimestamp(character().updated_at);
  });

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
      setSkillPoints(character().skill_points);
      setEditMode(false);
    });
  }

  const updateCharacter = async () => {
    const payload = {
      skill_points: skillPoints(),
      skill_levels: skillsData()
        .filter((item) => item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {})
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleSkills' }}>
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
                            {skill.name}
                          </p>
                          <Dice
                            width="28"
                            height="28"
                            text={modifier(skill.modifier)}
                            onClick={() => props.openD20Test(`/check skill ${slug}`, skill.name, skill.modifier)}
                          />
                        </div>
                      }
                    </For>
                  }
                >
                  <For each={skillsData().filter((item) => item.ability === slug)}>
                    {(skill) =>
                      <div class="fallout-skill">
                        <p class={`flex-1 flex items-center ${skill.level > 0 ? 'font-medium!' : ''}`}>
                          {skill.name}
                        </p>
                        <div class="fallout-skill-actions">
                          <Button
                            default
                            size="small"
                            disabled={skill.level === 0}
                            onClick={() => updateSkill(skill.slug, -1)}
                          ><Minus /></Button>
                          <p>{skill.level}</p>
                          <Button
                            default
                            size="small"
                            disabled={skill.level >= 10}
                            onClick={() => updateSkill(skill.slug, 1)}
                          ><Plus /></Button>
                        </div>
                      </div>
                    }
                  </For>
                </Show>
              }
            </For>
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
