import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Toggle, Button, Label, Select } from '../../../components';
import { Trash, Copy, Stroke } from '../../../assets';
import { fetchListRequest } from '../../../requests_v2/list';
import { fetchPublicationsRequest, createPublicationRequest } from '../../../requests_v2/publications';
import {
  fetchTransformationRequest, removeTransformationRequest, copyTransformationRequest
} from '../../../requests_v2/daggerheart/transformations';
import { fetchBooksForItemsRequest } from '../../../requests_v2/books';
import { createBookItemRequest } from '../../../requests_v2/bookItems';
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
    cancel: 'Cancel',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    save: 'Save',
    added: 'Content is added to the book'
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
    cancel: 'Отменить',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    save: 'Сохранить',
    added: 'Контент добавлен в книгу'
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
    cancel: 'Cancel',
    selectBook: 'Seleccionar libro',
    selectBookHelp: 'Seleccione los elementos necesarios para agregar al libro',
    save: 'Guardar',
    added: 'Contenido agregado al libro'
  }
}
const PARENT_TYPE = 'Daggerheart::Homebrews::Transformation';

export const DaggerheartTransformationsV2 = () => {
  const [books, setBooks] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

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
    const fetchBooks = async () => await fetchBooksForItemsRequest(appState.accessToken, 'daggerheart');
    const fetchTransformations = async () => await fetchListRequest(appState.accessToken, PARENT_TYPE);
    const fetchPublications = async () => await fetchPublicationsRequest(appState.accessToken, PARENT_TYPE);

    Promise.all([fetchTransformations(), fetchPublications(), fetchBooks()]).then(
      ([transformationsData, publicationsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books);
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

  const select = (e, id) => {
    e.stopPropagation();

    selectedIds().includes(id) ? setSelectedIds(selectedIds().filter((item) => item !== id)) : setSelectedIds(selectedIds().concat(id));
  }

  const addToBook = async () => {
    const result = await createBookItemRequest(appState.accessToken, book(), { ids: selectedIds(), itemable_type: PARENT_TYPE });

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
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
          <div class="flex items-center">
            <Select
              containerClassList="w-40"
              labelText={localize(TRANSLATION, locale()).selectBook}
              items={Object.fromEntries(books().map((item) => [item.id, item.name]))}
              selectedValue={book()}
              onSelect={setBook}
            />
            <Show when={book() && selectedIds().length > 0}>
              <Button default classList="px-2 py-1 mt-6 ml-4" onClick={addToBook}>
                {localize(TRANSLATION, locale()).save}
              </Button>
            </Show>
          </div>
          <p class="text-sm mt-1 mb-2">{localize(TRANSLATION, locale()).selectBookHelp}</p>
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
                            <Show when={book()}>
                              <Button
                                default
                                classList="p-2"
                                onClick={(e) => select(e, transformation.id)}
                              >
                                <span classList={{ 'opacity-25': !selectedIds().includes(transformation.id) }}>
                                  <Stroke width="16" height="12" />
                                </span>
                              </Button>
                            </Show>
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
