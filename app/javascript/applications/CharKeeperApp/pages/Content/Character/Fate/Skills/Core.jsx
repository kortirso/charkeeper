import { createSignal, For, Show, batch } from 'solid-js';

import { EditWrapper, Levelbox, Label, Dice } from '../../../../../components';
import { useAppLocale } from '../../../../../context';
import config from '../../../../../data/fate.json';
import { modifier, localize } from '../../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Skills',
    ladder: {
      superb: 'Superb',
      great: 'Great',
      good: 'Good',
      fair: 'Fair',
      average: 'Average'
    },
    check: 'Skill'
  },
  ru: {
    title: 'Навыки',
    ladder: {
      superb: 'Великолепный',
      great: 'Отличный',
      good: 'Хороший',
      fair: 'Неплохой',
      average: 'Средний'
    },
    check: 'Навык'
  },
  es: {
    title: 'Skills',
    ladder: {
      superb: 'Superb',
      great: 'Great',
      good: 'Good',
      fair: 'Fair',
      average: 'Average'
    },
    check: 'Skill'
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
                      {([slug, value]) =>
                        <p class="flex items-center gap-x-2 p-2">
                          {config.skills[slug].name[locale()]}
                          <Dice
                            width="30"
                            height="30"
                            text={modifier(value)}
                            onClick={() => props.openDiceRoll(`/check skill ${slug}`, character().selected_skills[slug], `${localize(TRANSLATION, locale()).check}, ${config.skills[slug].name[locale()]}`)}
                          />
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
