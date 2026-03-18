import { createEffect, createSignal, For, Show, batch } from 'solid-js';
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
    skillBoosts: 'You can improve your skills:'
  },
  ru: {
    free: 'Универсальное',
    skills: 'Навыки',
    skillBoosts: 'Вы можете улучшить следующие умения:'
  }
}

export const Pathfinder2Skills = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);

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
      setEditMode(character().guide_step === 2);
      setLastActiveCharacterId(character().id);
    });
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
    const result = skillsData().slice().map((item) => {
      if (slug !== item.slug) return item;

      return { ...item, name: value }
    });
    setSkillsData(result);
  }

  const updateCharacter = async () => {
    const payload = {
      selected_skills: skillsData()
        .filter((item) => item.slug !== 'lore1' && item.slug !== 'lore2' && item.level > 0)
        .reduce((acc, item) => {
          acc[item.slug] = item.level

          return acc
        }, {}),
      lore_skills: skillsData()
        .filter((item) => item.slug === 'lore1' || item.slug === 'lore2')
        .reduce((acc, item) => {
          acc[item.slug] = { name: item.name, level: item.level }

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
            <div class="warning">
              <p class="text-sm text-black!">{localize(TRANSLATION, locale()).skillBoosts}</p>
              <p class="text-sm text-black!">{renderSkillBoosts(character().skill_boosts)}</p>
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
                            {skill.name || localize(config.skills[skill.slug].name, locale())}
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
                            when={skill().slug === 'lore1' || skill().slug === 'lore2'}
                            fallback={localize(config.skills[skill().slug].name, locale())}
                          >
                            <Input
                              value={skill().name}
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
          </div>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
