import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Button, Input, TextArea, Select } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Edit, Plus, Close, Check, PlusSmall, Minus } from '../../assets';
import { fetchCharacterCustomResourcesRequest } from '../../requests/fetchCharacterCustomResourcesRequest';
import { createCharacterCustomResourceRequest } from '../../requests/createCharacterCustomResourceRequest';
import { updateCharacterCustomResourceRequest } from '../../requests/updateCharacterCustomResourceRequest';
import { removeCharacterCustomResourceRequest } from '../../requests/removeCharacterCustomResourceRequest';
import { updateCharacterResourceRequest } from '../../requests/updateCharacterResourceRequest';
import { localize, performResponse } from '../../helpers';

const TRANSLATION = {
  en: {
    title: 'Custom Resources',
    name: 'Name',
    description: 'Description',
    limit: 'Limit',
    resetDirection: 'Reset direction',
    directions: {
      0: 'Reset to 0',
      1: 'Reset to max'
    },
    rests: {
      daggerheart: {
        short: 'Short rest',
        long: 'Long rest',
        session: 'Session rest'
      },
      dnd5: {
        short: 'Short rest',
        long: 'Long rest'
      },
      dnd2024: {
        short: 'Short rest',
        long: 'Long rest'
      }
    }
  },
  ru: {
    title: 'Персональные ресурсы',
    name: 'Название',
    description: 'Описание',
    limit: 'Лимит',
    resetDirection: 'Направление сброса',
    directions: {
      0: 'Сброс до 0',
      1: 'Сброс до максимума'
    },
    rests: {
      daggerheart: {
        short: 'Короткий отдых',
        long: 'Длинный отдых',
        session: 'Между сессиями'
      },
      dnd5: {
        short: 'Короткий отдых',
        long: 'Длинный отдых'
      },
      dnd2024: {
        short: 'Короткий отдых',
        long: 'Длинный отдых'
      }
    }
  },
  es: {
    title: 'Custom Resources',
    name: 'Name',
    description: 'Description',
    limit: 'Limit',
    resetDirection: 'Reset direction',
    directions: {
      0: 'Reset to 0',
      1: 'Reset to max'
    },
    rests: {
      daggerheart: {
        short: 'Descanso corto',
        long: 'Descanso largo',
        session: 'Descanso entre sesiones'
      },
      dnd5: {
        short: 'Descanso corto',
        long: 'Descanso largo'
      },
      dnd2024: {
        short: 'Descanso corto',
        long: 'Descanso largo'
      }
    }
  }
}

export const ResourceWrapper = (props) => {
  const character = () => props.character;

  const [showSettings, setShowSettings] = createSignal(false);
  const [createMode, setCreateMode] = createSignal(false);

  const [customResources, setCustomResources] = createSignal(undefined);
  const [resourceForm, setResourceForm] = createStore({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const rests = createMemo(() => localize(TRANSLATION, locale()).rests[character().provider]);

  const fetchCharacterCustomResources = async () => await fetchCharacterCustomResourcesRequest(appState.accessToken, character().id);

  const fetchResources = async () => {
    const result = await fetchCharacterCustomResources();
    performResponse(
      result,
      function() {
        setCustomResources(result.custom_resources);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  createEffect(() => {
    if (!showSettings()) return;
    if (customResources()) return;

    fetchResources();
  });

  const addResource = () => {
    batch(() => {
      setResourceForm({ id: null, name: '', description: '', max_value: 1, reset_direction: '0', resets: Object.keys(rests()).reduce((acc, key) => { acc[key] = '1'; return acc }, {}) });
      setCreateMode(true);
    });
  }

  const changeResource = (resource) => {
    batch(() => {
      setResourceForm(resource);
      setCreateMode(true);
    });
  }

  const saveResource = () => {
    resourceForm.id ? updateResource() : createResource();
  }

  const createResource = async () => {
    const payload = { ...resourceForm, max_value: parseInt(resourceForm.max_value), reset_direction: parseInt(resourceForm.reset_direction), resets: Object.fromEntries(Object.entries(resourceForm.resets).map(([key, value]) => [key, parseInt(value)])) }
    const result = await createCharacterCustomResourceRequest(appState.accessToken, character().id, { resource: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          setCustomResources([result.custom_resource].concat(customResources()));
          setCreateMode(false);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const updateResource = async () => {
    const payload = { ...resourceForm, max_value: parseInt(resourceForm.max_value), reset_direction: parseInt(resourceForm.reset_direction), resets: Object.fromEntries(Object.entries(resourceForm.resets).map(([key, value]) => [key, parseInt(value)])) }
    const result = await updateCharacterCustomResourceRequest(appState.accessToken, character().id, resourceForm.id, { resource: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          setCustomResources(
            customResources().map((item) => {
              if (item.id !== payload.id) return item;

              return payload;
            })
          );
          setCreateMode(false);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const removeResource = async (id) => {
    const result = await removeCharacterCustomResourceRequest(appState.accessToken, character().id, id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setCustomResources(customResources().filter((item) => item.id !== id));
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const refreshResource = async (resource, modifier) => {
    const result = await updateCharacterResourceRequest(
      appState.accessToken, character().id, resource.id, { resource: { value: resource.value + modifier } }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter({
          resources: character().resources.map((item) => {
            if (item.id !== resource.id) return item;

            return { ...item, value: item.value + modifier }
          })
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <div class={[props.classList, 'blockable py-4 px-2 md:px-4 relative'].join(' ')}>
      <Button default classList="weapon-settings min-w-6 min-h-6" onClick={() => setShowSettings(!showSettings())}><Edit /></Button>
      <Show when={showSettings()} fallback={props.children}>
        <>
          <div class="flex gap-4 items-center">
            <Button default size="small" onClick={addResource}><Plus /></Button>
            <h2 class="weapon-title mb-0!">{localize(TRANSLATION, locale()).title}</h2>
          </div>
          <Show
            when={createMode()}
            fallback={
              <Show when={customResources() && customResources().length > 0}>
                <div class="mt-2">
                  <For each={customResources()}>
                    {(resource) =>
                      <div class="character-resource">
                        <div class="flex">
                          <p class="flex-1">{resource.name}</p>
                          <Button default size="small" classList="opacity-75" onClick={() => changeResource(resource)}>
                            <Edit width="16" height="16" />
                          </Button>
                          <Button default size="small" classList="ml-2 opacity-75" onClick={() => removeResource(resource.id)}>
                            <Close />
                          </Button>
                        </div>
                        <p class="mt-1">{resource.description}</p>
                      </div>
                    }
                  </For>
                </div>
              </Show>
            }
          >
            <div class="flex flex-col gap-2 mt-2">
              <Input
                labelText={localize(TRANSLATION, locale()).name}
                value={resourceForm.name}
                onInput={(value) => setResourceForm({ ...resourceForm, name: value })}
              />
              <TextArea
                rows="5"
                labelText={localize(TRANSLATION, locale()).description}
                value={resourceForm.description}
                onChange={(value) => setResourceForm({ ...resourceForm, description: value })}
              />
              <div class="flex gap-2">
                <Input
                  containerClassList="flex-1"
                  labelText={localize(TRANSLATION, locale()).limit}
                  value={resourceForm.max_value}
                  onInput={(value) => setResourceForm({ ...resourceForm, max_value: value })}
                />
                <Select
                  containerClassList="flex-1"
                  labelText={localize(TRANSLATION, locale()).resetDirection}
                  items={localize(TRANSLATION, locale()).directions}
                  selectedValue={resourceForm.reset_direction.toString()}
                  onSelect={(value) => setResourceForm({ ...resourceForm, reset_direction: value })}
                />
              </div>
              <div>
                <h3>{localize(TRANSLATION, locale()).rests}</h3>
                <div class="grid grid-cols-3 gap-2">
                  <For each={Object.entries(rests())}>
                    {([key, value]) =>
                      <Input
                        containerClassList="flex-1"
                        labelText={value}
                        value={resourceForm.resets[key]}
                        onInput={(value) => setResourceForm({ ...resourceForm, resets: { ...resourceForm.resets, [key]: value } })}
                      />
                    }
                  </For>
                </div>
              </div>
              <div class="flex gap-2 justify-end">
                <Button outlined classList="rounded min-w-6 min-h-6" onClick={() => setCreateMode(false)}>
                  <Close width="30" height="30" />
                </Button>
                <Button default classList="rounded min-w-6 min-h-6" onClick={saveResource}>
                  <Check width="20" height="20" />
                </Button>
              </div>
            </div>
          </Show>
        </>
      </Show>
      <Show when={!showSettings() && character().resources && character().resources.length > 0}>
        <div class="flex flex-col gap-2 mt-2">
          <For each={character().resources}>
            {(resource) =>
              <div>
                <p class="dh-attribute-title">{resource.custom_resources_name}</p>
                <div class="flex items-center gap-8">
                  <Button default size="small" disabled={resource.value <= 0} onClick={() => refreshResource(resource, -1)}><Minus /></Button>
                  <p class="text-center">
                    {resource.value} / {resource.custom_resources_max_value}
                  </p>
                  <Button default size="small" disabled={resource.value >= resource.custom_resources_max_value} onClick={() => refreshResource(resource, 1)}><PlusSmall /></Button>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
    </div>
  );
}
