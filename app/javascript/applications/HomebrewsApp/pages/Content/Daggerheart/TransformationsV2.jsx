import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Toggle, Button, Label } from '../../../components';
import { Trash, Copy } from '../../../assets';
import { fetchListRequest } from '../../../requests_v2/list';
import { fetchPublicationsRequest, createPublicationRequest } from '../../../requests_v2/publications';
import {
  fetchTransformationRequest, removeTransformationRequest, copyTransformationRequest
} from '../../../requests_v2/daggerheart/transformations';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    add: 'Create',
    showPublic: 'Show public',
    avatarFile: 'Select file',
    success: 'Publication is started',
    submit: 'Submit',
    publications: 'Publications',
    noErrors: 'No errors',
    copyCompleted: 'Copy is completed',
    fileExample: 'You can download file example, modify it with your data and use it for importing data to Charkeeper.',
    fileExampleDescription: 'Data example',
    cancel: 'Cancel'
  },
  ru: {
    add: 'Добавить',
    showPublic: 'Показать общедоступные',
    avatarFile: 'Выберите файл',
    success: 'Публикация началась',
    submit: 'Обработать файл',
    publications: 'Публикации',
    noErrors: 'Нет ошибок',
    copyCompleted: 'Копирование завершено',
    fileExample: 'Вы можете скачать шаблон файла, изменить данные и использовать новый файл для импорта данных в Charkeeper.',
    fileExampleDescription: 'Пример файла',
    cancel: 'Отменить'
  },
  es: {
    add: 'Agregar',
    showPublic: 'Mostrar públicos',
    avatarFile: 'Selecciona el archivo',
    success: 'Publication is started',
    submit: 'Submit',
    publications: 'Publications',
    noErrors: 'No errors',
    copyCompleted: 'Copy is completed',
    fileExample: 'You can download file example, modify it with your data and use it for importing data to Charkeeper.',
    fileExampleDescription: 'Data example',
    cancel: 'Cancel'
  }
}
const PARENT_TYPE = 'Daggerheart::Homebrews::Transformation';

export const DaggerheartTransformationsV2 = () => {
  const [transformations, setTransformations] = createSignal(undefined);
  const [publications, setPublications] = createSignal(undefined);

  const [createMode, setCreateMode] = createSignal(false);
  const [ownFilter, setOwnFilter] = createSignal(true);
  const [showPublications, setShowPublications] = createSignal(false);

  const [infos, setInfos] = createSignal({});
  const [openInfos, setOpenInfos] = createSignal({});

  const [selectedFile, setSelectedFile] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    const fetchTransformations = async () => await fetchListRequest(appState.accessToken, PARENT_TYPE);
    const fetchPublications = async () => await fetchPublicationsRequest(appState.accessToken, PARENT_TYPE);

    Promise.all([fetchTransformations(), fetchPublications()]).then(
      ([transformationsData, publicationsData]) => {
        batch(() => {
          setPublications(publicationsData.publications);
          setTransformations(transformationsData.homebrews);
        });
      }
    );
  });

  const filtered = createMemo(() => {
    if (transformations() === undefined) return [];

    return transformations().filter(({ own }) => ownFilter() ? own : !own);
  });

  const handleFileChange = (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];

      setSelectedFile(file);
    }
  }

  const submitPublication = async () => {
    if (!selectedFile()) return;

    const requestData = new FormData();
    requestData.append('file', selectedFile());
    requestData.append('parent_type', PARENT_TYPE);

    const result = await createPublicationRequest(appState.accessToken, requestData);
    if (result.errors_list === undefined) {
      batch(() => {
        renderNotice(localize(TRANSLATION, locale()).success);
      });
    } else renderAlerts(result.errors_list);
  }

  const showInfo = async (transformation) => {
    if (infos()[transformation.id]) {
      setOpenInfos({ ...openInfos(), [transformation.id]: !openInfos()[transformation.id] })
    } else {
      const result = await fetchTransformationRequest(appState.accessToken, transformation.id);
      if (result.errors_list === undefined) {
        batch(() => {
          setInfos({ ...infos(), [transformation.id]: result.transformation });
          setOpenInfos({ ...openInfos(), [transformation.id]: true })
        });
      } else renderAlerts(result.errors_list);
    }
  }

  const remove = async (e, id) => {
    e.stopPropagation();

    const result = await removeTransformationRequest(appState.accessToken, id);
    if (result.errors_list === undefined) {
      setTransformations(transformations().filter((item) => item.id !== id ));
    } else renderAlerts(result.errors_list);
  }

  const copy = async (e, id) => {
    e.stopPropagation();

    const result = await copyTransformationRequest(appState.accessToken, id);
    if (result.errors_list === undefined) {
      setTransformations([result.transformation].concat(transformations()));
      renderNotice(localize(TRANSLATION, locale()).copyCompleted);
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={transformations() !== undefined} fallback={<></>}>
      <div class="flex my-4">
        <div class="flex-1">
          <Button default classList="px-2 py-1" onClick={() => setCreateMode(true)}>{localize(TRANSLATION, locale()).add}</Button>
          <Button default active={!ownFilter()} classList="ml-4 px-2 py-1" onClick={() => setOwnFilter(!ownFilter())}>{localize(TRANSLATION, locale()).showPublic}</Button>
        </div>
        <div class="relative flex-1 flex justify-end">
          <Button default active={showPublications()} classList="px-2 py-1" onClick={() => setShowPublications(!showPublications())}>{localize(TRANSLATION, locale()).publications}</Button>
          <Show when={showPublications()}>
            <div class="absolute top-8 z-10 bg-white rounded border border-black">
              <For each={publications()}>
                {(publication) =>
                  <div class="flex flex-col gap-2 p-4">
                    <p class="text-sm">{publication.completed_at}</p>
                    <div>
                      <Show
                        when={Object.keys(publication.errors_list).length === 0}
                        fallback={
                          <For each={Object.entries(publication.errors_list)}>
                            {([index, values]) =>
                              <div>
                                <p class="text-sm">{index}</p>
                                <For each={Object.entries(values)}>
                                  {([slug, list]) =>
                                    <p class="text-sm">
                                      {slug} - {list.join('; ')}
                                    </p>
                                  }
                                </For>
                              </div>
                            }
                          </For>
                        }
                      >
                        {localize(TRANSLATION, locale()).noErrors}
                      </Show>
                    </div>
                  </div>
                }
              </For>
            </div>
          </Show>
        </div>
      </div>
      <Show
        when={!createMode()}
        fallback={
          <>
            <p>{localize(TRANSLATION, locale()).fileExample}</p>
            <p class="mb-4"><a download="transformations.json" class="underline" href="https://github.com/kortirso/charkeeper/blob/master/spec/fixtures/transformations.json">{localize(TRANSLATION, locale()).fileExampleDescription}</a></p>
            <Label labelText={localize(TRANSLATION, locale()).avatarFile} />
            <input class="block mb-2" type="file" accept="application/json" onChange={handleFileChange} />
            <div class="flex gap-1">
              <Button default classList="px-2 py-1" onClick={() => setCreateMode(false)}>{localize(TRANSLATION, locale()).cancel}</Button>
              <Button default classList="px-2 py-1" onClick={submitPublication}>{localize(TRANSLATION, locale()).submit}</Button>
            </div>
          </>
        }
      >
        <Show when={filtered().length > 0}>
          <div class="flex flex-col gap-2">
            <For each={filtered()}>
              {(transformation) =>
                <Toggle
                  disabled
                  onParentClick={() => showInfo(transformation)}
                  isOpenByParent={openInfos()[transformation.id]}
                  title={
                    <div class="flex items-center">
                      <div class="flex-1 flex flex-col gap-2">
                        <p class="text-xl">{transformation.title}</p>
                        <p
                          class="feat-markdown mt-1"
                          innerHTML={transformation.description} // eslint-disable-line solid/no-innerhtml
                        />
                      </div>

                      <div class="col-span-2 flex items-start justify-end gap-2">
                        <Show
                          when={ownFilter()}
                          fallback={
                            <Button default classList="px-2 py-1" onClick={(e) => copy(e, transformation.id)}>
                              <Copy width="20" height="20" />
                            </Button>
                          }
                        >
                          <div class="flex items-center justify-end gap-1 text-neutral-700">
                            <Button default classList="px-2 py-1" onClick={(e) => remove(e, transformation.id)}>
                              <Trash width="20" height="20" />
                            </Button>
                          </div>
                        </Show>
                      </div>

                    </div>
                  }
                >
                  <Show when={infos()[transformation.id]}>
                    <div class="flex flex-col gap-2">
                      <For each={infos()[transformation.id].features}>
                        {(feature) =>
                          <div>
                            <p class="font-medium!">{feature.title}</p>
                            <p
                              class="feat-markdown mt-1"
                              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                            />
                          </div>
                        }
                      </For>
                    </div>
                  </Show>
                </Toggle>
              }
            </For>
          </div>
        </Show>
      </Show>
    </Show>
  );
}
