import { createSignal, For, Show, batch } from 'solid-js';

import { EditWrapper, Levelbox, Label } from '../../../../../components';
import { useAppLocale } from '../../../../../context';
import config from '../../../../../data/fate.json';

const TRANSLATION = {
  en: {
    title: 'Skills',
    ladder: {
      superb: 'Superb +5',
      great: 'Great +4',
      good: 'Good +3',
      fair: 'Fair +2',
      average: 'Average +1'
    }
  },
  ru: {
    title: 'Навыки',
    ladder: {
      superb: 'Великолепный +5',
      great: 'Отличный +4',
      good: 'Хороший +3',
      fair: 'Неплохой +2',
      average: 'Средний +1'
    }
  },
  es: {
    title: 'Skills',
    ladder: {
      superb: 'Superb +5',
      great: 'Great +4',
      good: 'Good +3',
      fair: 'Fair +2',
      average: 'Average +1'
    }
  }
}

export const FateCoreSkills = (props) => {
  const character = () => props.character;

  const [editMode, setEditMode] = createSignal(false);

  const [locale] = useAppLocale();

  const cancelEditing = () => {
    batch(() => {
      setEditMode(false);
      props.setSelectedSkills({ ...character().selected_skills });
    });
  }

  const updateSkill = (slug) => {
    const currentValue = props.selectedSkills[slug];
    const newValue = currentValue ? (currentValue === 5 ? 0 : (currentValue + 1)) : 1;

    props.setSelectedSkills({ ...props.selectedSkills, [slug]: newValue });
  }

  const updateCharacter = () => {
    props.updateCharacter({ selected_skills: props.selectedSkills });
    setEditMode(false);
  }

  return (
    <EditWrapper
      editMode={editMode()}
      onSetEditMode={setEditMode}
      onCancelEditing={cancelEditing}
      onSaveChanges={updateCharacter}
    >
      <div class="blockable p-4">
        <h2 class="text-lg">{TRANSLATION[locale()].title}</h2>
        <Show
          when={editMode()}
          fallback={
            <For each={[[5, 'superb'], [4, 'great'], [3, 'good'], [2, 'fair'], [1, 'average']]}>
              {([level, ladder]) =>
                <div class="mt-2">
                  <Label labelText={TRANSLATION[locale()].ladder[ladder]} labelClassList="text-xs!" />
                  <div class="flex items-center gap-x-2 flex-wrap mt-1">
                    <For each={Object.entries(character().selected_skills).filter(([, value]) => value === parseInt(level))}>
                      {([slug]) =>
                        <p class="tag">
                          {config.skills[slug].name[locale()]}
                        </p>
                      }
                    </For>
                  </div>
                </div>
              }
            </For>
          }
        >
          <For each={Object.entries(config.skills)}>
            {([slug, values]) =>
              <div class="flex items-center mb-1">
                <Levelbox
                  classList="mr-2"
                  value={props.selectedSkills[slug] ? props.selectedSkills[slug] : 0}
                  onToggle={() => updateSkill(slug)}
                />
                <p class="flex-1 flex items-center">
                  {values.name[locale()]}
                </p>
              </div>
            }
          </For>
        </Show>
      </div>
    </EditWrapper>
  );
}
