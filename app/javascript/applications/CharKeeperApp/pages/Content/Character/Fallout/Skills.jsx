import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills.',
    skillBoosts: 'Skill points',
    skillTagBoosts: 'Tag skills',
    skills: 'Skills'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам.',
    skillBoosts: 'Очки навыков',
    skillTagBoosts: 'Владение навыками',
    skills: 'Навыки'
  }
}

export const FalloutSkills = (props) => {
  const character = () => props.character;

  const [skillPoints, setSkillPoints] = createStore({});

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal([]);

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
      setLastActiveCharacterId(character().id);
      setSkillPoints({
        skillBoosts: character().skill_boosts,
        skillTagBoosts: character().tag_skill_boosts
      })
    });
  });

  const toggleSkillTag = (slug) => {
    let modifier;
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;
      modifier = item.expertise ? -1 : 1;

      return { ...item, expertise: !item.expertise } 
    });
    batch(() => {
      if (modifier > 0) {
        if (skillPoints.skillTagBoosts > 0) {
          setSkillPoints({ ...skillPoints, skillTagBoosts: skillPoints.skillTagBoosts - 1 });
        } else {
          setSkillPoints({ ...skillPoints, skillBoosts: skillPoints.skillBoosts - 1 });
        }
      } else {
        if (skillsData().filter((item) => item.expertise).length > character().tag_skill_boosts) {
          setSkillPoints({ ...skillPoints, skillBoosts: skillPoints.skillBoosts + 1 });
        } else {
          setSkillPoints({ ...skillPoints, skillTagBoosts: skillPoints.skillTagBoosts +1 });
        }
      }
      setSkillsData(result);
    });
  }

  const updateSkill = (slug) => {
    let difference;
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const maxLevel = 4 + (item.expertise ? 0 : 2);

      const newValue = item.level === maxLevel ? 0 : (item.level === undefined ? 1 : (item.level + 1));
      difference = newValue - item.level;
      return { ...item, level: newValue } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, skillBoosts: skillPoints.skillBoosts - difference });
      setSkillsData(result);
    });
  }

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setEditMode(false);
    });
  }

  const updateCharacterSkills = () => {
    const skills = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const tagSkills = skillsData().filter((item) => item.expertise).map((item) => item.slug);

    updateCharacter({ character: { skills: skills, tag_skills: tagSkills } }, setEditMode, false);
  }

  const updateCharacter = async (payload, callback, callbackPayload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, payload);

    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          props.onReplaceCharacter(result.character);
          callback(callbackPayload);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'FalloutSkills' }}>
      <GuideWrapper
        character={character()}
        guideStep={2}
        helpMessage={localize(TRANSLATION, locale()).helpMessage}
        onReloadCharacter={props.onReloadCharacter}
        finishGuideStep={true}
      >
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacterSkills}
        >
          <div class="blockable p-4 pb-8">
            <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
            <Show when={skillPoints.skillBoosts > 0 || skillPoints.skillTagBoosts > 0}>
              <div class="mt-2">
                <p>{localize(TRANSLATION, locale()).skillBoosts} {skillPoints.skillBoosts}</p>
                <p>{localize(TRANSLATION, locale()).skillTagBoosts} {skillPoints.skillTagBoosts}</p>
              </div>
            </Show>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 mt-2">
              <For each={Object.keys(config.abilities)}>
                {(slug) =>
                  <For each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                    {(skill) =>
                      <div class="flex items-center mb-1">
                        <Show
                          when={editMode()}
                          fallback={<Levelbox classList="mr-2" value={skill.level} />}
                        >
                          <Checkbox classList="mr-2" checked={skill.expertise} onToggle={() => toggleSkillTag(skill.slug)} />
                          <Levelbox classList="mr-2" value={skill.level} onToggle={() => updateSkill(skill.slug)} />
                        </Show>
                        <p class="uppercase mr-4">{localize(config.abilities[skill.ability].shortName, locale())}</p>
                        <p class="flex-1 flex" classList={{ 'font-medium!': skill.expertise }}>
                          {config.skills[skill.slug].name[locale()]}
                        </p>
                        <p>{modifier(skill.modifier)}</p>
                      </div>
                    }
                  </For>
                }
              </For>
            </div>
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
