import { createSignal, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, Levelbox, Input, EditWrapper } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

import { modifier } from '../../../../helpers';

export const Pathfinder2Skills = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const updateSkill = (slug) => {
    const result = skillsData().slice().map((item) => {
      if (item.slug !== slug) return item;

      const newValue = item.level === 4 ? 0 : (item.level + 1);
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

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setEditMode(false);
      });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Skills' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <div class="blockable p-4 mb-2">
          <For each={Object.keys(config.abilities)}>
            {(slug) =>
              <Key
                each={(editMode() ? skillsData() : character().skills).filter((item) => item.ability === slug)}
                by={item => item.slug}
              >
                {(skill) =>
                  <div class="flex justify-between items-center mb-1">
                    <Show
                      when={editMode()}
                      fallback={<p class="dark:text-snow mr-4">{skill().level}</p>}
                    >
                      <Levelbox
                        classList="mr-2"
                        value={skill().level}
                        onToggle={() => updateSkill(skill().slug)}
                      />
                    </Show>
                    <p class="uppercase dark:text-snow mr-4">{skill().ability}</p>
                    <p class={`flex-1 flex items-center dark:text-snow ${skill().level > 0 ? 'font-normal!' : ''}`}>
                      <Show
                        when={editMode() && (skill().slug === 'lore1' || skill().slug === 'lore2')}
                        fallback={skill().name || config.skills[skill().slug].name[locale()]}
                      >
                        <Input
                          containerClassList="ml-2"
                          value={skill().name}
                          onInput={(value) => changeLoreSkill(skill().slug, value)}
                        />
                      </Show>
                    </p>
                    <span class="dark:text-snow">
                      {modifier(skill().modifier + skill().prof + skill().item + (skill().armor || 0))}
                    </span>
                  </div>
                }
              </Key>
            }
          </For>
        </div>
      </EditWrapper>
    </ErrorWrapper>
  );
}
