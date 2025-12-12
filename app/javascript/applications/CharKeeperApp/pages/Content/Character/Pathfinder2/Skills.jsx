import { createSignal, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { ErrorWrapper, Levelbox, Input, EditWrapper, Dice } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    free: 'Free',
    skillBoosts: 'You can improve your skills:'
  },
  ru: {
    free: 'Универсальное',
    skillBoosts: 'Вы можете улучшить следующие умения:'
  }
}

export const Pathfinder2Skills = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const renderSkillBoosts = (skillBoosts) => {
    const result = [];
    Object.keys(skillBoosts).forEach((key) => {
      if (key === 'free') return;

      result.push(`${key.split('_').map((item) => config.skills[item].name[locale()]).join('/')} - ${skillBoosts[key]}`)
    });
    if (skillBoosts.free) result.push(`${TRANSLATION[locale()].free} - ${skillBoosts.free}`);

    return result.join('; ');
  }

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
        <Show when={character().skill_boosts}>
          <div class="warning">
            <p class="text-sm">{TRANSLATION[locale()].skillBoosts}</p>
            <p class="text-sm">{renderSkillBoosts(character().skill_boosts)}</p>
          </div>
        </Show>
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
                      fallback={<Levelbox classList="mr-2" value={skill().level} />}
                    >
                      <Levelbox classList="mr-2" value={skill().level} onToggle={() => updateSkill(skill().slug)} />
                    </Show>
                    <p class="uppercase mr-4">{skill().ability}</p>
                    <p class={`flex-1 flex items-center ${skill().level > 0 ? 'font-medium!' : ''}`}>
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
                    <span>
                      <Dice
                        width="28"
                        height="28"
                        text={modifier(skill().total_modifier)}
                        onClick={() => props.openDiceRoll(`/check skill ${skill().slug}`, skill().total_modifier)}
                      />
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
