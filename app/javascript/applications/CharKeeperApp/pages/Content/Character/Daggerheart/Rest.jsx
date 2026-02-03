import { createSignal, createEffect, createMemo, batch, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Button, IconButton, ErrorWrapper, Checkbox, GuideWrapper, Toggle, Input, TextArea, Select } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Close, Edit } from '../../../../assets';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { fetchDaggerheartProjectsRequest } from '../../../../requests/fetchDaggerheartProjectsRequest';
import { createDaggerheartProjectRequest } from '../../../../requests/createDaggerheartProjectRequest';
import { updateDaggerheartProjectRequest } from '../../../../requests/updateDaggerheartProjectRequest';
import { removeDaggerheartProjectRequest } from '../../../../requests/removeDaggerheartProjectRequest';
import { replace } from '../../../../helpers';

const TRANSLATION = {
  en: {
    values: {
      short: 'Short rest',
      long: 'Long rest',
      session: 'Session rest'
    },
    description: "At rest player can move domain cards between its loadout and vault for free, then choose twice from the list of downtime moves. You also can help with clearing HP and armor slots for your party members, but these options are not visible here.",
    makeRolls: 'Make auto rolls',
    clear_health_short: 'Clear 1d4+{{tier}} Hit Points for yourself',
    clear_stress_short: 'Clear 1d4+{{tier}} Stress',
    clear_armor_slots_short: 'Clear 1d4+{{tier}} Armor Slots from your armor',
    clear_health_long: 'Clear all Hit Points for yourself',
    clear_stress_long: 'Clear all Stress',
    clear_armor_slots_long: 'Clear all Armor Slots from your armor',
    gain_hope: 'Gain a Hope for prepare',
    gain_double_hope: 'Gain 2 Hope for prepare with party member',
    title: 'Projects',
    projectTitle: "Project's title",
    projectDescription: "Project's description",
    complexity: "Project's complexity",
    textHelp: 'You can use Markdown for editing description',
    save: 'Save',
    cancel: 'Cancel',
    newProject: 'ADD NEW PROJECT',
    progress: "Project's progress",
    valueLabel: 'Select type of rest',
    rest: 'Make rest',
    complete: 'Rest is completed',
    firstAction: 'First downtime action',
    secondAction: 'Second downtime action',
    workOnProject: 'Work on project',
    makeProjectRolls: 'Make project rolls against difficulty',
    projectDc: "Progress check difficulty",
    projectRoll: 'Project progress',
    completed: ' (Completed)'
  },
  ru: {
    values: {
      short: 'Короткий отдых',
      long: 'Длинный отдых',
      session: 'Между сессиями'
    },
    description: 'Во время отдыха игрок может свободно перемещать карты домена между инвентарём и хранилищем, затем дважды выбрать из списка ходов отдыха. Вы также можете помочь с очисткой ран и слотов доспеха товарищам, но эти опции тут не учтены.',
    makeRolls: 'Автоматические броски',
    clear_health_short: 'Очистить 1d4+{{tier}} ран для себя',
    clear_stress_short: 'Очистить 1d4+{{tier}} ячеек стресса',
    clear_armor_slots_short: 'Очистить 1d4+{{tier}} слотов доспеха для себя',
    clear_health_long: 'Очистить все раны для себя',
    clear_stress_long: 'Очистить все ячейки стресса',
    clear_armor_slots_long: 'Очистить все слоты доспеха для себя',
    gain_hope: 'Получить Надежду за подготовку',
    gain_double_hope: 'Получить 2 Надежды за подготовку с товарищем',
    title: 'Проекты',
    projectTitle: 'Название проекта',
    projectDescription: 'Описание проекта',
    complexity: 'Сложность проекта',
    textHelp: 'Вы можете использовать Markdown для редактирования описания',
    save: 'Сохранить',
    cancel: 'Отменить',
    newProject: 'ДОБАВИТЬ ПРОЕКТ',
    progress: 'Прогресс выполнения проекта',
    valueLabel: 'Выберите тип отдыха',
    rest: 'Провести отдых',
    complete: 'Отдых завершён',
    firstAction: 'Первое действие отдыха',
    secondAction: 'Второе действие отдыха',
    workOnProject: 'Работа над проектом',
    makeProjectRolls: 'Авто броски против сложности',
    projectDc: 'Сложность проверки прогресса',
    projectRoll: 'Прогресс проекта',
    completed: ' (Завершён)'
  }
}
const DOWNTIME_ACTIONS = ['clear_health', 'clear_stress', 'clear_armor_slots', 'gain_hope', 'gain_double_hope'];

export const DaggerheartRest = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [projects, setProjects] = createSignal([]);

  const [projectsEditMode, setProjectsEditMode] = createSignal(false);
  const [makeRolls, setMakeRolls] = createSignal(false);
  const [makeProjectRolls, setMakeProjectRolls] = createSignal(false);
  const [projectRoll, setProjectRoll] = createSignal(1);
  const [firstAction, setFirstAction] = createSignal(null);
  const [secondAction, setSecondAction] = createSignal(null);
  const [workOnProject, setWorkOnProject] = createSignal(null);
  const [projectForm, setProjectForm] = createStore({ title: '', description: '', complexity: 1 });
  const [value, setValue] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchProjects = async () => await fetchDaggerheartProjectsRequest(appState.accessToken, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchProjects()]).then(
      ([projectsData]) => {
        setProjects(projectsData.projects);
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const updateType = (value) => {
    batch(() => {
      setValue(value);
      setFirstAction(null);
      setSecondAction(null);
      setWorkOnProject(null);
    });
  }

  const restActions = createMemo(() => {
    if (value() === null) return {};

    const result = DOWNTIME_ACTIONS.reduce((acc, key) => {
      acc[key] = replace(TRANSLATION[locale()][key.startsWith('clear') ? `${key}_${value()}` : key], { tier: character().tier });
      return acc;
    }, {});

    if (value() === 'long') result.project = TRANSLATION[locale()].workOnProject;

    return result;
  });

  const restCharacter = async () => {
    const restOptions = { clear_health: 0, clear_stress: 0, clear_armor_slots: 0, gain_hope: 0, gain_double_hope: 0, project: 0 };
    const projectOptions = {
      id: workOnProject(), manual_roll: (makeProjectRolls() ? null : parseInt(projectRoll())), dc: (makeProjectRolls() ? parseInt(projectRoll()) : null)
    };
    if (firstAction()) restOptions[firstAction()] += 1;
    if (secondAction()) restOptions[secondAction()] += 1;

    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { value: value(), options: restOptions, make_rolls: makeRolls(), project: projectOptions }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        setFirstAction(null);
        setSecondAction(null);
        workOnProject(null);
        setMakeRolls(false);
        renderNotice(TRANSLATION[locale()].complete);
      });
      if (workOnProject()) {
        const projectsData = await fetchProjects();
        setProjects(projectsData.projects);
      }
    } else renderAlerts(result.errors_list);
  }

  const addProject = () => {
    batch(() => {
      setProjectForm({ title: '', description: '', complexity: 1 });
      setProjectsEditMode(true);
    });
  }

  const editProject = (project) => {
    batch(() => {
      setProjectForm({ id: project.id, title: project.title, description: project.description, complexity: project.complexity });
      setProjectsEditMode(true);
    });
  }

  const createProject = async () => {
    const result = await createDaggerheartProjectRequest(appState.accessToken, appState.activePageParams.id, { project: projectForm });

    if (result.errors_list === undefined) {
      setProjects([result.project].concat(projects()));
      cancelProject();
    }
  }

  const updateProject = async () => {
    const result = await updateDaggerheartProjectRequest(appState.accessToken, appState.activePageParams.id, projectForm.id, { project: projectForm });

    if (result.errors_list === undefined) {
      setProjects(projects().slice().map((item) => {
        if (item.id !== projectForm.id) return item;

        return result.project;
      }));
      cancelProject();
    }
  }

  const cancelProject = () => {
    batch(() => {
      setProjectForm({ title: '', description: '', complexity: 1 });
      setProjectsEditMode(false);
    });
  }

  const removeProject = async (event, projectId) => {
    event.stopPropagation();

    const result = await removeDaggerheartProjectRequest(appState.accessToken, appState.activePageParams.id, projectId);
    if (result.errors_list === undefined) setProjects(projects().filter((item) => item.id !== projectId));
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartRest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p>{TRANSLATION[locale()].description}</p>
          <Select
            containerClassList="w-full mt-4"
            labelText={TRANSLATION[locale()].valueLabel}
            items={TRANSLATION[locale()].values}
            selectedValue={value()}
            onSelect={updateType}
          />
          <Show when={value() && value() !== 'session'}>
            <Checkbox
              classList="mt-2"
              labelText={TRANSLATION[locale()].makeRolls}
              labelPosition="right"
              labelClassList="ml-2"
              checked={makeRolls()}
              onToggle={() => setMakeRolls(!makeRolls())}
            />
            <Select
              containerClassList="w-full mt-2"
              labelText={TRANSLATION[locale()].firstAction}
              items={restActions()}
              selectedValue={firstAction()}
              onSelect={setFirstAction}
            />
            <Select
              containerClassList="w-full mt-2"
              labelText={TRANSLATION[locale()].secondAction}
              items={restActions()}
              selectedValue={secondAction()}
              onSelect={setSecondAction}
            />
            <Show when={firstAction() === 'project' || secondAction() === 'project'}>
              <Select
                containerClassList="w-full mt-2"
                labelText={TRANSLATION[locale()].workOnProject}
                items={Object.fromEntries(projects().map((item) => [item.id, item.title]))}
                selectedValue={workOnProject()}
                onSelect={setWorkOnProject}
              />
              <Show when={workOnProject()}>
                <Checkbox
                  classList="mt-2"
                  labelText={TRANSLATION[locale()].makeProjectRolls}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={makeProjectRolls()}
                  onToggle={() => setMakeProjectRolls(!makeProjectRolls())}
                />

                <Input
                  numeric
                  containerClassList="mt-2"
                  labelText={makeProjectRolls() ? TRANSLATION[locale()].projectDc : TRANSLATION[locale()].projectRoll}
                  value={projectRoll()}
                  onInput={setProjectRoll}
                />
              </Show>
            </Show>
          </Show>
          <Button default textable classList="mt-4" onClick={restCharacter}>{TRANSLATION[locale()].rest}</Button>
        </div>
        <Show
          when={!projectsEditMode()}
          fallback={
            <div class="p-4 flex-1 flex flex-col blockable mt-4">
              <div class="flex-1">
                <Input
                  labelText={TRANSLATION[locale()].projectTitle}
                  value={projectForm.title}
                  onInput={(value) => setProjectForm({ ...projectForm, title: value })}
                />
                <TextArea
                  rows="5"
                  containerClassList="mt-2"
                  labelText={TRANSLATION[locale()].projectDescription}
                  value={projectForm.description}
                  onChange={(description) => setProjectForm({ ...projectForm, description: description })}
                />
                <p class="text-sm mt-1">{TRANSLATION[locale()].textHelp}</p>
                <Input
                  numeric
                  containerClassList="mt-2"
                  labelText={TRANSLATION[locale()].complexity}
                  value={projectForm.complexity}
                  onInput={(value) => setProjectForm({ ...projectForm, complexity: parseInt(value) })}
                />
              </div>
              <div class="flex justify-end mt-4">
                <Button outlined textable size="small" classList="mr-4" onClick={cancelProject}>{TRANSLATION[locale()].cancel}</Button>
                <Button
                  default
                  textable
                  size="small"
                  onClick={() => projectForm.id === undefined ? createProject() : updateProject()}
                >{TRANSLATION[locale()].save}</Button>
              </div>
            </div>
          }
        >
          <Button default textable classList="mt-4 mb-2 w-full" onClick={addProject}>
            {TRANSLATION[locale()].newProject}
          </Button>
          <Show when={projects() !== undefined}>
            <For each={projects()}>
              {(project) =>
                <Toggle title={
                  <div class="flex items-center">
                    <p class="flex-1">
                      {project.title}
                      <Show when={project.progress >= project.complexity}>
                        {TRANSLATION[locale()].completed}
                      </Show>
                    </p>
                    <IconButton onClick={(e) => removeProject(e, project.id)}>
                      <Close />
                    </IconButton>
                  </div>
                }>
                  <div class="relative">
                    <p>{TRANSLATION[locale()].progress} - {project.progress}/{project.complexity}</p>
                    <p
                      class="feat-markdown mt-2"
                      innerHTML={project.markdown_description} // eslint-disable-line solid/no-innerhtml
                    />
                    <Button
                      default
                      classList="absolute -bottom-4 -right-4 rounded opacity-50"
                      onClick={() => editProject(project)}
                    >
                      <Edit width={20} height={20} />
                    </Button>
                  </div>
                </Toggle>
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
