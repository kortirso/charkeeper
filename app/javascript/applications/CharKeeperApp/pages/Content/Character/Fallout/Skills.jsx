import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, GuideWrapper, Dice, Button } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills.',
    skillBoosts: 'Skill points',
    skillTagBoosts: 'Tag skills',
    skills: 'Skills',
    needSpend: 'Need spend all skill points',
    overQualified: 'Too many skill points spent per skill',
    overLeveled: 'Too many skill points spent per skill at 1 level',
    check: 'Skill',
    warning: 'The maximum rank at level 1 is 3, at the others it is 6, learning a skill gives +2 to the rank.'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам.',
    skillBoosts: 'Очки навыков',
    skillTagBoosts: 'Владение навыками',
    skills: 'Навыки',
    needSpend: 'Нужно потратить все очки навыков',
    overQualified: 'Потрачено много очков навыков на навыки',
    overLeveled: 'Потрачено много очков навыков на навыки на 1 уровне',
    check: 'Навык',
    warning: 'Максимальный ранг на 1 уровне - 3, на остальных - 6, обученность навыку даёт +2 к рангу.'
  }
}

export const FalloutSkills = (props) => {
  const character = () => props.character;

  const [skillPoints, setSkillPoints] = createStore({});

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal([]);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
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

  const maxSkillLevel = createMemo(() => character().level === 1 ? 3 : 6);

  const toggleSkillTag = (slug) => {
    let modifier;
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;
      modifier = item.expertise ? -1 : 1;

      return { ...item, expertise: !item.expertise } 
    });
    if (skillPoints.skillTagBoosts === 0 && modifier > 0) return;

    batch(() => {
      setSkillPoints({ ...skillPoints, skillTagBoosts: skillPoints.skillTagBoosts - modifier });
      setSkillsData(result);
    });
  }

  const updateSkill = (slug, modifier) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, level: item.level + modifier } 
    });
    batch(() => {
      setSkillPoints({ ...skillPoints, skillBoosts: skillPoints.skillBoosts - modifier });
      setSkillsData(result);
    });
  }

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setSkillPoints({
        skillBoosts: character().skill_boosts,
        skillTagBoosts: character().tag_skill_boosts
      })
      setEditMode(false);
    });
  }

  const updateCharacterSkills = () => {
    const overQualified = skillsData().filter((item) => (item.level + (item.expertise ? 2 : 0)) > 6).map((item) => localize(config.skills[item.slug].name, locale()));
    if (overQualified.length > 0) return renderAlert(`${localize(TRANSLATION, locale()).overQualified}: ${overQualified.join(', ')}`);

    if (character().level === 1) {
      const overLeveled = skillsData().filter((item) => (item.level + (item.expertise ? 2 : 0)) > 3).map((item) => localize(config.skills[item.slug].name, locale()));
      if (overLeveled.length > 0) return renderAlert(`${localize(TRANSLATION, locale()).overLeveled}: ${overLeveled.join(', ')}`);
    }

    if (skillPoints.skillBoosts !== 0 || skillPoints.skillTagBoosts !== 0) return renderAlert(localize(TRANSLATION, locale()).needSpend);

    const skills = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});
    const tagSkills = skillsData().filter((item) => item.expertise).map((item) => item.slug);

    updateCharacter({ character: { skills: skills, tag_skills: tagSkills } });
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, payload);

    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          props.onReplaceCharacter(result.character);
          setEditMode(false);
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
        onNextClick={props.onNextGuideStepClick}
      >
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacterSkills}
        >
          <div class="blockable p-4 pb-8">
            <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
            <div class="mt-2">
              <p class="text-sm">{localize(TRANSLATION, locale()).skillBoosts} {skillPoints.skillBoosts}</p>
              <p class="text-sm">{localize(TRANSLATION, locale()).skillTagBoosts} {skillPoints.skillTagBoosts}</p>
            </div>
            <Show when={editMode()}>
              <div class="warning mt-2">
                <p class="text-sm text-black!">{localize(TRANSLATION, locale()).warning}</p>
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
                            <Levelbox classList="mr-2" value={skill.modifier} />
                            <p class="uppercase mr-4">{localize(config.abilities[skill.ability].shortName, locale())}</p>
                            <p class="flex-1" classList={{ 'font-medium!': skill.expertise }}>
                              {localize(config.skills[skill.slug].name, locale())}
                            </p>
                            <Dice
                              width="30"
                              height="30"
                              text={skill.modifier + skill.attribute_modifier}
                              onClick={() => props.openDiceRoll(`/check skill "${localize(config.skills[skill.slug].name, locale())}"`, `${localize(TRANSLATION, locale()).check}, ${localize(config.skills[skill.slug].name, locale())}`, skill.modifier + skill.attribute_modifier, (skill.expertise ? skill.modifier : 1))}
                            />
                          </div>
                        }
                      </For>
                    }
                  >
                    <For each={skillsData().filter((item) => item.ability === slug)}>
                      {(skill) =>
                        <div class="fallout-skill">
                          <Checkbox classList="mr-2" checked={skill.expertise} onToggle={() => toggleSkillTag(skill.slug)} />
                          <p class="flex-1" classList={{ 'font-medium!': skill.expertise }}>
                            {localize(config.skills[skill.slug].name, locale())}
                          </p>
                          <div class="fallout-skill-actions">
                            <Button
                              default
                              size="small"
                              disabled={skill.level === 0}
                              onClick={() => skill.level === 0 ? null : updateSkill(skill.slug, -1)}
                            ><Minus /></Button>
                            <p>{skill.level}</p>
                            <Button
                              default
                              size="small"
                              disabled={skill.level >= maxSkillLevel() - (skill.expertise ? 2 : 0)}
                              onClick={() => skill.level >= maxSkillLevel() - (skill.expertise ? 2 : 0) ? null : updateSkill(skill.slug, 1)}
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
      </GuideWrapper>
    </ErrorWrapper>
  );
}
