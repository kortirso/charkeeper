import { createEffect, createSignal, For, Show, batch } from 'solid-js';

import { ErrorWrapper, EditWrapper, GuideWrapper, Dice, Checkbox, Input, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Close, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Fill data about skills.',
    skills: 'Skills',
    add: 'Add'
  },
  ru: {
    helpMessage: 'Заполните данные по навыкам.',
    skills: 'Навыки',
    add: 'Добавить'
  },
  es: {
    helpMessage: 'Rellena los datos sobre las habilidades.',
    skills: 'Habilidades',
    add: 'Agregar'
  }
}

export const Cthulhu7Skills = (props) => {
  const character = () => props.character;

  const [lastTimestamp, setLastTimestamp] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [skillsData, setSkillsData] = createSignal(character().skills);
  const [selectedSkills, setSelectedSkills] = createSignal(character().selected_skills);
  const [improvedSkills, setImprovedSkills] = createSignal(character().improved_skills);
  const [hiddenSkills, setHiddenSkills] = createSignal(character().hidden_skills);
  const [additionalSkills, setAdditionalSkills] = createSignal(character().additional_skills);

  const [newSkill, setNewSkill] = createSignal('');
  const [newSkillStart, setNewSkillStart] = createSignal(1);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastTimestamp() === character().updated_at) return;

    batch(() => {
      setSkillsData(character().skills);
      setSelectedSkills(character().selected_skills);
      setImprovedSkills(character().improved_skills);
      setHiddenSkills(character().hidden_skills);
      setAdditionalSkills(character().additional_skills);
      setEditMode(character().guide_step === 2);
    });

    setLastTimestamp(character().updated_at);
  });

  const cancelEditing = () => {
    batch(() => {
      setSkillsData(character().skills);
      setSelectedSkills(character().selected_skills);
      setImprovedSkills(character().improved_skills);
      setHiddenSkills(character().hidden_skills);
      setAdditionalSkills(character().additional_skills);
      setEditMode(false);
    });
  }

  const saveNewSkill = () => {
    if (newSkill().length === 0) return;
    if (!newSkillStart()) return;

    const id = Math.floor(Math.random() * 1000000).toString();
    batch(() => {
      setSkillsData(skillsData().concat({ slug: id, name: newSkill(), level: newSkillStart(), start: newSkillStart() }));
      setAdditionalSkills({ ...additionalSkills(), [id]: { name: newSkill(), start: newSkillStart() } });
      setNewSkill('');
      setNewSkillStart(1);
    });
  }

  const updateCharacter = async () => {
    const payload = {
      selected_skills: selectedSkills(),
      improved_skills: improvedSkills(),
      hidden_skills: hiddenSkills(),
      additional_skills: additionalSkills()
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Skills' }}>
      <EditWrapper
        editMode={editMode()}
        onSetEditMode={setEditMode}
        onCancelEditing={cancelEditing}
        onSaveChanges={updateCharacter}
      >
        <GuideWrapper
          character={character()}
          guideStep={2}
          helpMessage={localize(TRANSLATION, locale()).helpMessage}
          onReloadCharacter={props.onReloadCharacter}
          finishGuideStep={true}
        >
          <div class="blockable blockable-padding pb-8!">
            <p class="text-lg">{localize(TRANSLATION, locale()).skills}</p>
            <div class="fallout-skills">
              <Show
                when={editMode()}
                fallback={
                  <For each={character().skills.filter((item) => !item.hidden).sort((a, b) => a.name > b.name)}>
                    {(skill) =>
                      <div class="fallout-skill">
                        <p class={`flex-1 ${skill.improved ? 'font-medium!' : ''}`}>
                          {skill.name}
                        </p>
                        <Dice
                          width="28"
                          height="28"
                          text={skill.level}
                          onClick={() => props.openCthulhuTest(`/check skill "${skill.slug}"`, skill.name, skill.level)}
                        />
                        <div class="ml-1">
                          <p class="text-xs text-center w-4">{Math.trunc(skill.level / 2)}</p>
                          <p class="text-xs text-center w-4">{Math.trunc(skill.level / 5)}</p>
                        </div>
                      </div>
                    }
                  </For>
                }
              >
                <For each={skillsData().sort((a, b) => a.name > b.name)}>
                  {(skill) =>
                    <div class="fallout-skill gap-2" classList={{ 'opacity-75': hiddenSkills().includes(skill.slug) }}>
                      <Checkbox
                        checked={improvedSkills().includes(skill.slug)}
                        onToggle={() => improvedSkills().includes(skill.slug) ? setImprovedSkills(improvedSkills().filter((item) => item !== skill.slug)) : setImprovedSkills(improvedSkills().concat([skill.slug]))}
                      />
                      <p class="flex-1 text-sm">{skill.name}</p>
                      <Input
                        size="small"
                        containerClassList="w-[4rem]!"
                        value={selectedSkills()[skill.slug] || ''}
                        onInput={(value) => setSelectedSkills({ ...selectedSkills(), [skill.slug]: value })}
                      />
                      <Show
                        when={hiddenSkills().includes(skill.slug)}
                        fallback={
                          <Button default classList="rounded min-w-4! min-h-4!" onClick={() => setHiddenSkills(hiddenSkills().concat([skill.slug]))}>
                            <Close width="24" height="24" />
                          </Button>
                        }
                      >
                        <Button default classList="rounded min-w-4! min-h-4!" onClick={() => setHiddenSkills(hiddenSkills().filter((item) => item !== skill.slug))}>
                          <PlusSmall width="24" height="24" />
                        </Button>
                      </Show>
                    </div>
                  }
                </For>
                <div class="flex flex-row items-center gap-x-2">
                  <Input containerClassList="flex-1" value={newSkill()} onInput={setNewSkill} />
                  <Input containerClassList="flex-1" value={newSkillStart()} onInput={setNewSkillStart} />
                  <Button default textable onClick={saveNewSkill}>{localize(TRANSLATION, locale()).add}</Button>
                </div>
              </Show>
            </div>
          </div>
        </GuideWrapper>
      </EditWrapper>
    </ErrorWrapper>
  );
}
