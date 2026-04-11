import { createSignal, createEffect, For, Show, batch, Switch, Match } from 'solid-js';

import { ErrorWrapper, Levelbox, EditWrapper, Dice, GuideWrapper, Button, Checkbox } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills.',
    anySkillBoosts: 'You can learn any skills, amount - ',
    skillBoosts: 'You can learn skills from the following list, amount - ',
    check: 'Skill',
    skills: 'Skills'
  },
  ru: {
    helpMessage: 'Заполните данные по умениям.',
    anySkillBoosts: 'Вы можете изучить любые умения, кол-во - ',
    skillBoosts: 'Вы можете изучить умения из следующего списка, кол-во - ',
    check: 'Умение',
    skills: 'Умения'
  },
  es: {
    helpMessage: 'Rellena los datos sobre las habilidades.',
    anySkillBoosts: 'Puedes aprender cualquier habilidad, cantidad - ',
    skillBoosts: 'Puedes aprender habilidades de la siguiente lista, cantidad - ',
    check: 'Habilidad',
    skills: 'Habilidades'
  }
}

export const Dnd5Skills = (props) => {
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

  const toggleSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, selected: !item.selected };
    });
    setSkillsData(result);
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

  const updateCharacter = async () => {
    let selectedSkills;
    if (character().provider === 'dnd2024') {
      selectedSkills = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {})
    } else {
      selectedSkills = skillsData().filter((item) => item.selected).map((item) => item.slug)
    }

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { selected_skills: selectedSkills } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Skills' }}>
      <GuideWrapper
        character={character()}
        guideStep={2}
        helpMessage={localize(TRANSLATION, locale())['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
        onNextClick={props.onNextGuideStepClick}
      >
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="blockable py-4 px-2 md:px-4 pb-8">
            <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
            <Show when={character().skill_boosts > 0 || character().any_skill_boosts > 0}>
              <div class="warning mt-2">
                <Show when={character().any_skill_boosts > 0}>
                  <p class="text-sm text-black!">{localize(TRANSLATION, locale())['anySkillBoosts']} {character().any_skill_boosts}</p>
                </Show>
                <Show when={character().skill_boosts > 0}>
                  <Show when={character().any_skill_boosts > 0}>
                    <div class="mt-2" />
                  </Show>
                  <p class="text-sm text-black!">{localize(TRANSLATION, locale())['skillBoosts']} {character().skill_boosts}</p>
                  <p class="text-sm text-black!">{Object.entries(config.skills).filter(([slug]) => character().skill_boosts_list.includes(slug)).map(([, values]) => localize(values.name, locale())).join(', ')}</p>
                </Show>
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
                            <Switch>
                              <Match when={character().provider === 'dnd5'}>
                                <Levelbox classList="mr-2" value={skill.selected ? 1 : 0} />
                              </Match>
                              <Match when={character().provider === 'dnd2024'}>
                                <Levelbox classList="mr-2" value={skill.level} />
                              </Match>
                            </Switch>
                            <p class="uppercase mr-4">{skill.ability}</p>
                            <p class="flex-1 flex items-center" classList={{ 'font-medium!': skill.selected }}>
                              {localize(config.skills[skill.slug].name, locale())}
                            </p>
                            <Dice
                              width="28"
                              height="28"
                              text={modifier(skill.modifier)}
                              onClick={() => props.openDiceRoll(`/check skill "${skill.slug}"`, skill.modifier, `${localize(TRANSLATION, locale())['check']}, ${localize(config.skills[skill.slug].name, locale())}`)}
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
                            {localize(config.skills[skill.slug].name, locale())}
                          </p>
                          <div class="fallout-skill-actions">
                            <Show
                              when={character().provider === 'dnd2024'}
                              fallback={
                                <Checkbox classList="mr-2" checked={skill.selected} onToggle={() => toggleSkill(skill.slug)} />
                              }
                            >
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
                                disabled={skill.level >= (character().provider === 'dnd5' ? 1 : 2)}
                                onClick={() => skill.level >= (character().provider === 'dnd5' ? 1 : 2) ? null : updateSkill(skill.slug, 1)}
                              ><Plus /></Button>
                            </Show>
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
