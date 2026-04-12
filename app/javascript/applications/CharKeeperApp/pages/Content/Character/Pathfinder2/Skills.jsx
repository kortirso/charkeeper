import { createEffect, createSignal, createMemo, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, Levelbox, Input, EditWrapper, Dice, Button } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    free: 'Free',
    skills: 'Skills',
    skillBoosts: 'You can improve your skills:',
    add: 'Add skill',
    maxSkillLevel: 'Maximum skill level for character: '
  },
  ru: {
    free: 'Универсальное',
    skills: 'Навыки',
    skillBoosts: 'Вы можете улучшить следующие умения:',
    add: 'Добавить навык',
    maxSkillLevel: 'Максимальный уровень владения навыком: '
  },
  es: {
    free: 'Libre',
    skills: 'Habilidades',
    skillBoosts: 'Puedes mejorar tus habilidades:',
    add: 'Agregar habilidad',
    maxSkillLevel: 'Nivel máximo de habilidad para el personaje: '
  }
}

export const Pathfinder2Skills = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [loresData, setLoresData] = createSignal(character().lores);

  const [newSkill, setNewSkill] = createSignal('');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id && character().guide_step !== 1) {
      setEditMode(character().guide_step === 2);
      return;
    }

    batch(() => {
      setSkillsData(character().skills);
      setLoresData(character().lores);
      setEditMode(character().guide_step === 2);
      setLastActiveCharacterId(character().id);
    });
  });

  const maxSkillLevel = createMemo(() => {
    if (character().level >= 15) return 4;
    if (character().level >= 7) return 3;

    return character().level >= 3 ? 2 : 1;
  });

  const renderSkillBoosts = (skillBoosts) => {
    const result = [];
    Object.keys(skillBoosts).forEach((key) => {
      if (key === 'free') return;

      result.push(`${key.split('_').map((item) => localize(config.skills[item].name, locale())).join('/')} - ${skillBoosts[key]}`)
    });
    if (skillBoosts.free) result.push(`${localize(TRANSLATION, locale()).free} - ${skillBoosts.free}`);

    return result.join('; ');
  }

  const updateSkill = (slug, modifier) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, level: item.level + modifier } 
    });
    setSkillsData(result);
  }

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const changeLoreSkill = (slug, value) => {
    setLoresData({ ...loresData(), [slug]: value });
  }

  const saveNewSkill = () => {
    if (newSkill().length === 0) return;

    const id = Math.floor(Math.random() * 1000000).toString();
    batch(() => {
      setSkillsData(skillsData().concat({ slug: id, ability: 'int', level: 0 }));
      setLoresData({ ...loresData(), [id]: newSkill() });
      setNewSkill('');
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
      lores: loresData()
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Skills' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4 pb-8">
          <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
          <Show when={character().skill_boosts}>
            <div class="warning mt-2">
              <p class="text-sm text-black!">{localize(TRANSLATION, locale()).skillBoosts}</p>
              <p class="text-sm text-black!">{renderSkillBoosts(character().skill_boosts)}</p>
            </div>
          </Show>
          <Show when={editMode()}>
            <div class="warning mt-2">
              <p class="text-sm text-black!">{localize(TRANSLATION, locale()).maxSkillLevel} {maxSkillLevel()}</p>
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
                            {config.skills[skill.slug] ? localize(config.skills[skill.slug].name, locale()) : character().lores[skill.slug]}
                          </p>
                          <Dice
                            width="28"
                            height="28"
                            text={modifier(skill.total_modifier)}
                            onClick={() => props.openDiceRoll(`/check skill "${skill.slug}"`, skill.total_modifier)}
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
                              value={loresData()[skill().slug]}
                              onInput={(value) => changeLoreSkill(skill().slug, value)}
                            />
                          </Show>
                        </p>
                        <div class="fallout-skill-actions">
                          <Button
                            default
                            size="small"
                            disabled={skill().level === 0}
                            onClick={() => skill().level === 0 ? null : updateSkill(skill().slug, -1)}
                          ><Minus /></Button>
                          <p>{skill().level}</p>
                          <Button
                            default
                            size="small"
                            disabled={skill().level >= 4}
                            onClick={() => skill().level >= 4 ? null : updateSkill(skill().slug, 1)}
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
                <Input
                  containerClassList="flex-1"
                  value={newSkill()}
                  onInput={setNewSkill}
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
