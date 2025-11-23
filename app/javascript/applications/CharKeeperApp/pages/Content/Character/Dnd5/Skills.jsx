import { createSignal, createEffect, For, Show, batch, Switch, Match } from 'solid-js';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper, Dice, GuideWrapper } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills.',
    anySkillBoosts: 'You can learn any skills, amount - ',
    skillBoosts: 'You can learn skills from the following list, amount - '
  },
  ru: {
    helpMessage: 'Заполните данные по умениям.',
    anySkillBoosts: 'Вы можете изучить любые умения, кол-во - ',
    skillBoosts: 'Вы можете изучить умения из следующего списка, кол-во - '
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
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setSkillsData(character().skills);
      setLastActiveCharacterId(character().id);
    });
  });

  const toggleSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      return { ...item, selected: !item.selected } 
    });
    setSkillsData(result);
  }

  const updateSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const newValue = item.level === 2 ? 0 : (item.level === undefined ? 1 : (item.level + 1));
      return { ...item, level: newValue } 
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
        helpMessage={TRANSLATION[locale()]['helpMessage']}
        onReloadCharacter={props.onReloadCharacter}
      >
        <Show when={character().guide_step === 2 && (character().any_skill_boosts > 0 || character().any_skill_boosts > 0)}>
          <div class="warning">
            <Show when={character().any_skill_boosts > 0}>
              <p class="text-sm">{TRANSLATION[locale()]['anySkillBoosts']} {character().any_skill_boosts}</p>
            </Show>
            <Show when={character().skill_boosts > 0}>
              <Show when={character().any_skill_boosts > 0}>
                <div class="mt-2" />
              </Show>
              <p class="text-sm">{TRANSLATION[locale()]['skillBoosts']} {character().skill_boosts}</p>
              <p class="text-sm">{Object.entries(config.skills).filter(([slug]) => character().skill_boosts_list.includes(slug)).map(([, values]) => values.name[locale()]).join(', ')}</p>
            </Show>
          </div>
        </Show>
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateCharacter}
        >
          <div class="blockable p-4 mb-2">
            <For each={Object.keys(config.abilities)}>
              {(slug) =>
                <For each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                  {(skill) =>
                    <div class="flex items-center mb-1">
                      <Show
                        when={editMode()}
                        fallback={
                          <p class="dark:text-snow mr-4">{skill.level ? skill.level : (skill.selected ? 1 : 0)}</p>
                        }
                      >
                        <Switch>
                          <Match when={character().provider === 'dnd5'}>
                            <Checkbox
                              classList="mr-2"
                              checked={skill.selected}
                              onToggle={() => toggleSkill(skill.slug)}
                            />
                          </Match>
                          <Match when={character().provider === 'dnd2024'}>
                            <Levelbox
                              classList="mr-2"
                              value={skill.level}
                              onToggle={() => updateSkill(skill.slug)}
                            />
                          </Match>
                        </Switch>
                    </Show>
                      <p class="uppercase dark:text-snow mr-4">{skill.ability}</p>
                      <p class={`flex-1 flex items-center dark:text-snow ${skill.level > 0 ? 'font-normal!' : ''}`}>
                        {config.skills[skill.slug].name[locale()]}
                      </p>
                      <Dice
                        width="28"
                        height="28"
                        text={modifier(skill.modifier)}
                        onClick={() => props.openDiceRoll(`/check skill ${skill.slug}`, skill.modifier)}
                      />
                    </div>
                  }
                </For>
              }
            </For>
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
