import { createSignal, createEffect, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Checkbox, Levelbox, EditWrapper } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Dc20Skills = (props) => {
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

      return { ...item, expertise: !item.expertise } 
    });
    setSkillsData(result);
  }

  const updateSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const maxLevel = Math.round(character().level / 5) + 1 + (item.expertise ? 1 : 0);

      const newValue = item.level === maxLevel ? 0 : (item.level === undefined ? 1 : (item.level + 1));
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
    const skillLevels = skillsData().reduce((acc, item) => { acc[item.slug] = item.level; return acc }, {});

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { skill_levels: skillLevels } }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Skills' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4 mb-2">
          <For each={['prime'].concat(Object.keys(config.abilities))}>
            {(slug) =>
              <For each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}>
                {(skill) =>
                  <div class="flex items-center mb-1">
                    <Show
                      when={editMode()}
                      fallback={
                        <p class="dark:text-snow mr-4">{skill.level ? skill.level : (skill.expertise ? 1 : 0)}</p>
                      }
                    >
                      <Checkbox
                        classList="mr-2"
                        checked={skill.expertise}
                        onToggle={() => toggleSkill(skill.slug)}
                      />
                      <Levelbox
                        classList="mr-2"
                        value={skill.level}
                        onToggle={() => updateSkill(skill.slug)}
                      />
                    </Show>
                    <p class="uppercase dark:text-snow mr-4">{skill.ability === 'prime' ? 'prm' : skill.ability}</p>
                    <p class={`flex-1 flex items-center dark:text-snow ${skill.level > 0 ? 'font-normal!' : ''}`}>
                      {config.skills[skill.slug].name[locale()]}
                    </p>
                    <span class="dark:text-snow">{modifier(skill.modifier)}</span>
                  </div>
                }
              </For>
            }
          </For>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
