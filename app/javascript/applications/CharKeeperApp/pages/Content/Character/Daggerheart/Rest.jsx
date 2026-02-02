import { createSignal, createEffect, batch, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import {
  Button, IconButton, ErrorWrapper, Levelbox, Checkbox, GuideWrapper, Toggle, Input, TextArea
} from '../../../../components';
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
    short: 'Short rest',
    long: 'Long rest',
    session: 'Session rest',
    description: "At rest player can move domain cards between its loadout and vault for free, then choose twice from the list of downtime moves.",
    makeRolls: 'Make auto rolls',
    clear_health: 'Clear 1d4+{{tier}} or all Hit Points for yourself',
    clear_stress: 'Clear 1d4+{{tier}} or all Stress',
    clear_armor_slots: 'Clear 1d4+{{tier}} or all Armor Slots from your armor',
    gain_hope: 'Gain a Hope',
    gain_double_hope: 'Gain 2 Hope',
    title: 'Projects',
    projectTitle: "Project's title",
    projectDescription: "Project's description",
    complexity: "Project's complexity",
    textHelp: 'You can use Markdown for editing description',
    save: 'Save',
    cancel: 'Cancel',
    newProject: 'ADD NEW PROJECT',
    progress: "Project's progress"
  },
  ru: {
    short: 'Короткий отдых',
    long: 'Длинный отдых',
    session: 'Между сессиями',
    description: 'Во время отдыха игрок может свободно перемещать карты домена между инвентарём и хранилищем, затем дважды выбрать из списка ходов отдыха.',
    makeRolls: 'Автоматические броски',
    clear_health: 'Очистить 1d4+{{tier}} или все ХП для себя',
    clear_stress: 'Очистить 1d4+{{tier}} или все стресса',
    clear_armor_slots: 'Очистить 1d4+{{tier}} или все слотов доспеха для себя',
    gain_hope: 'Получить Надежду',
    gain_double_hope: 'Получить 2 Надежды',
    title: 'Проекты',
    projectTitle: 'Название проекта',
    projectDescription: 'Описание проекта',
    complexity: 'Сложность проекта',
    textHelp: 'Вы можете использовать Markdown для редактирования описания',
    save: 'Сохранить',
    cancel: 'Отменить',
    newProject: 'ДОБАВИТЬ ПРОЕКТ',
    progress: 'Прогресс выполнения проекта'
  }
}

export const DaggerheartRest = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [projects, setProjects] = createSignal([]);

  const [projectsEditMode, setProjectsEditMode] = createSignal(false);
  const [makeRolls, setMakeRolls] = createSignal(false);
  const [restOptions, setRestOptions] = createStore({
    clear_health: 0,
    clear_stress: 0,
    clear_armor_slots: 0,
    gain_hope: 0,
    gain_double_hope: 0
  });
  const [projectForm, setProjectForm] = createStore({
    title: '',
    description: '',
    complexity: 1
  });

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchProjects = async () => await fetchDaggerheartProjectsRequest(appState.accessToken, character().id);

    Promise.all([fetchProjects()]).then(
      ([projectsData]) => {
        setProjects(projectsData.projects);
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const updateOption = (value) => {
    const newValue = restOptions[value] === 2 ? 0 : (restOptions[value] + 1);
    setRestOptions({ ...restOptions, [value]: newValue });
  }

  const restCharacter = async (payload) => {
    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { ...payload, options: restOptions, make_rolls: makeRolls() }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        props.onReloadCharacter();
        setRestOptions({ clear_health: 0, clear_stress: 0, clear_armor_slots: 0, gain_hope: 0, gain_double_hope: 0 });
        setMakeRolls(false);
        renderNotice(t('alerts.restIsFinished'));
      });
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
          <p class="mb-4">{TRANSLATION[locale()].description}</p>
          <For each={['clear_health', 'clear_stress', 'clear_armor_slots', 'gain_hope', 'gain_double_hope']}>
            {(item) =>
              <Levelbox
                number
                classList="mb-1"
                labelText={replace(TRANSLATION[locale()][item], { tier: character().tier })}
                labelPosition="right"
                labelClassList="ml-2"
                value={restOptions[item]}
                onToggle={() => updateOption(item)}
              />
            }
          </For>
          <Checkbox
            classList="mb-4"
            labelText={TRANSLATION[locale()].makeRolls}
            labelPosition="right"
            labelClassList="ml-2"
            checked={makeRolls()}
            onToggle={() => setMakeRolls(!makeRolls())}
          />
          <div class="grid grid-cols-1 lg:grid-cols-3 lg:gap-4">
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'short' })}>
              {TRANSLATION[locale()].short}
            </Button>
            <Button default textable classList="mb-2 lg:mb-0" onClick={() => restCharacter({ value: 'long' })}>
              {TRANSLATION[locale()].long}
            </Button>
            <Button default textable onClick={() => restCharacter({ value: 'session' })}>
              {TRANSLATION[locale()].session}
            </Button>
          </div>
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
                    <p class="flex-1">{project.title}</p>
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
