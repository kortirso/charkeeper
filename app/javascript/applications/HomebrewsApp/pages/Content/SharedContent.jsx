import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Toggle, Button, Label, Select, createModal } from '../../components';
import { Trash, Copy, Stroke } from '../../assets';
import { fetchPublicationsRequest, createPublicationRequest } from '../../requests_v2/publications';
import { fetchBooksForItemsRequest } from '../../requests_v2/books';
import { createBookItemRequest } from '../../requests_v2/bookItems';
import { localize } from '../../helpers';

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
    added: 'Content is added to the book',
    deletingHomebrew: 'Deleting is not revertable!',
    delete: 'Delete',
    deletingProgress: 'Deleting',
    deleteAll: 'Delete selected',
    deletingAll: 'Deleting selected homebrews'
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
    added: 'Контент добавлен в книгу',
    deletingHomebrew: 'Удаление не обратимо!',
    delete: 'Удалить',
    deletingProgress: 'Удаление',
    deleteAll: 'Удалить выбранные',
    deletingAll: 'Удаление выбранных homebrews'
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
    added: 'Contenido agregado al libro',
    deletingHomebrew: 'Deleting is not revertable!',
    delete: 'Delete',
    deletingProgress: 'Deleting',
    deleteAll: 'Delete selected',
    deletingAll: 'Deleting selected homebrews'
  }
}

export const SharedContent = (props) => {
  const ChildrenComponent = props.childrenComponent; // eslint-disable-line solid/reactivity

  const [books, setBooks] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [elements, setElements] = createSignal(undefined);
  const [deletingHomebrew, setDeletingHomebrew] = createSignal(null);
  const [deletingAll, setDeletingAll] = createSignal(false);
  const [publications, setPublications] = createSignal(undefined);

  const [createMode, setCreateMode] = createSignal(false);
  const [ownFilter, setOwnFilter] = createSignal(true);
  const [showPublications, setShowPublications] = createSignal(false);

  const [infos, setInfos] = createSignal({});
  const [openInfos, setOpenInfos] = createSignal({});

  const [selectedFile, setSelectedFile] = createSignal(null);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksForItemsRequest(appState.accessToken, props.provider);
    const fetchPublications = async () => await fetchPublicationsRequest(appState.accessToken, props.publicationType);

    Promise.all([props.onFetchRequest(), fetchPublications(), fetchBooks()]).then(
      ([elementsData, publicationsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books);
          setPublications(publicationsData.publications);
          setElements(elementsData.homebrews);
        });
      }
    );
  });

  const filtered = createMemo(() => {
    if (elements() === undefined) return [];

    return elements().filter(({ own }) => ownFilter() ? own : !own);
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
    requestData.append('parent_type', props.publicationType);
    requestData.append('provider', props.provider);

    const result = await createPublicationRequest(appState.accessToken, requestData);
    if (result.errors_list === undefined) {
      batch(() => {
        renderNotice(localize(TRANSLATION, locale()).success);
        setSelectedFile(null);
        setCreateMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  const showInfo = async (element) => {
    if (!props.onShowRequest) return;

    if (infos()[element.id]) {
      setOpenInfos({ ...openInfos(), [element.id]: !openInfos()[element.id] })
    } else {
      const result = await props.onShowRequest(appState.accessToken, element.id);
      if (result.errors_list === undefined) {
        batch(() => {
          setInfos({ ...infos(), [element.id]: result.homebrew });
          setOpenInfos({ ...openInfos(), [element.id]: true })
        });
      } else renderAlerts(result.errors_list);
    }
  }

  const removeAll = () => {
    batch(() => {
      setDeletingAll(true);
      setDeletingHomebrew(null);
    });
    openModal();
  }

  const cancelDeletingAll = () => {
    setDeletingAll(false);
    closeModal();
  }

  const removeAllHomebrew = async () => {
    const result = await props.onBatchDestroy(selectedIds());
    if (result.errors_list === undefined) {
      batch(() => {
        setElements(elements().filter((item) => !selectedIds().includes(item.id) ));
        setSelectedIds([]);
      });
      closeModal();
    } else renderAlerts(result.errors_list);
  }

  const remove = (e, element) => {
    e.stopPropagation();

    batch(() => {
      setDeletingAll(false);
      setDeletingHomebrew(element);
    });
    openModal();
  }

  const cancelDeleting = () => {
    setDeletingHomebrew(null);
    closeModal();
  }

  const removeHomebrew = async () => {
    const result = await props.onRemoveRequest(appState.accessToken, deletingHomebrew().id);
    if (result.errors_list === undefined) {
      setElements(elements().filter((item) => item.id !== deletingHomebrew().id ));
      closeModal();
    } else renderAlerts(result.errors_list);
  }

  const copy = async (e, id) => {
    e.stopPropagation();

    const result = await props.onCopyRequest(appState.accessToken, id);
    if (result.errors_list === undefined) {
      setElements([result.homebrew].concat(elements()));
      renderNotice(localize(TRANSLATION, locale()).copyCompleted);
    } else renderAlerts(result.errors_list);
  }

  const select = (e, id) => {
    e.stopPropagation();

    selectedIds().includes(id) ? setSelectedIds(selectedIds().filter((item) => item !== id)) : setSelectedIds(selectedIds().concat(id));
  }

  const addToBook = async () => {
    const result = await createBookItemRequest(appState.accessToken, book(), { ids: selectedIds(), itemable_type: props.parentType });

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={elements() !== undefined} fallback={<></>}>
      <div class="flex my-4">
        <div class="flex-1">
          <Button default classList="px-2 py-1" onClick={() => setCreateMode(true)}>{localize(TRANSLATION, locale()).add}</Button>
          <Show when={props.onCopyRequest}>
            <Button default active={!ownFilter()} classList="ml-4 px-2 py-1" onClick={() => setOwnFilter(!ownFilter())}>{localize(TRANSLATION, locale()).showPublic}</Button>
          </Show>
        </div>
        <div class="relative flex-1 flex justify-end">
          <Button default active={showPublications()} classList="px-2 py-1" onClick={() => setShowPublications(!showPublications())}>{localize(TRANSLATION, locale()).publications}</Button>
          <Show when={showPublications()}>
            <div class="absolute top-8 z-10 bg-white rounded border border-black">
              <For each={publications()}>
                {(publication) =>
                  <div class="flex flex-col p-4">
                    <p class="text-sm">{publication.completed_at}</p>
                    <div>
                      <Show
                        when={Object.keys(publication.errors_list).length === 0}
                        fallback={
                          <For each={Object.entries(publication.errors_list)}>
                            {([index, values]) =>
                              <div>
                                <p class="text-sm">Index {index}</p>
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
            <p class="mb-4"><a target="_blank" rel="noopener noreferrer" class="underline" href={`https://github.com/kortirso/charkeeper/blob/master/spec/fixtures/${props.provider}/${props.publicationType}.json`}>{localize(TRANSLATION, locale()).fileExampleDescription}</a></p>
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
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <Select
                containerClassList="w-40"
                labelText={localize(TRANSLATION, locale()).selectBook}
                items={Object.fromEntries(books().map((item) => [item.id, item.title]))}
                selectedValue={book()}
                onSelect={setBook}
              />
              <Show when={book() && selectedIds().length > 0}>
                <Button default classList="px-2 py-1 mt-6 ml-4" onClick={addToBook}>
                  {localize(TRANSLATION, locale()).save}
                </Button>
              </Show>
            </div>
            <Show when={props.onBatchDestroy && selectedIds().length > 0 && ownFilter()}>
              <Button default disabled={selectedIds().length === 0} classList="px-2 py-1" onClick={removeAll}>{localize(TRANSLATION, locale()).deleteAll}</Button>
            </Show>
          </div>
          <div class="flex flex-col gap-2">
            <For each={filtered()}>
              {(element) =>
                <Toggle
                  disabled
                  onParentClick={() => showInfo(element)}
                  isOpenByParent={openInfos()[element.id]}
                  title={
                    <div class="flex items-center">
                      <div class="flex-1 flex flex-col gap-2">
                        <p class="text-xl">{element.title}</p>
                        <Show when={element.description}>
                          <p
                            class="feat-markdown mt-1"
                            innerHTML={element.description} // eslint-disable-line solid/no-innerhtml
                          />
                        </Show>
                      </div>
                      <div class="col-span-2 flex items-start justify-end gap-2">
                        <Show
                          when={ownFilter()}
                          fallback={
                            <Button default classList="px-2 py-1" onClick={(e) => copy(e, element.id)}>
                              <Copy width="20" height="20" />
                            </Button>
                          }
                        >
                          <div class="flex items-center justify-end gap-1 text-neutral-700">
                            <Button
                              default
                              classList="p-2"
                              onClick={(e) => select(e, element.id)}
                            >
                              <span classList={{ 'opacity-25': !selectedIds().includes(element.id) }}>
                                <Stroke width="16" height="12" />
                              </span>
                            </Button>
                            <Show when={props.onRemoveRequest}>
                              <Button default classList="px-2 py-1" onClick={(e) => remove(e, element)}>
                                <Trash width="20" height="20" />
                              </Button>
                            </Show>
                          </div>
                        </Show>
                      </div>
                    </div>
                  }
                >
                  <Show when={props.childrenComponent && infos()[element.id]}>
                    <ChildrenComponent info={infos()[element.id]} />
                  </Show>
                </Toggle>
              }
            </For>
          </div>
        </Show>
      </Show>
      <Modal>
        <Show when={deletingHomebrew()}>
          <p class="mb-2 text-xl">{localize(TRANSLATION, locale()).deletingProgress} - {deletingHomebrew().title}</p>
          <p class="mb-4">{localize(TRANSLATION, locale()).deletingHomebrew}</p>
          <div class="flex gap-4 w-full">
            <Button default classList="flex-1 text-center" onClick={cancelDeleting}>{localize(TRANSLATION, locale()).cancel}</Button>
            <Button default classList="flex-1 text-center" onClick={removeHomebrew}>{localize(TRANSLATION, locale()).delete}</Button>
          </div>
        </Show>
        <Show when={deletingAll()}>
          <p class="mb-4 text-xl">{localize(TRANSLATION, locale()).deletingAll}</p>
          <div class="flex gap-4 w-full">
            <Button default classList="flex-1 text-center" onClick={cancelDeletingAll}>{localize(TRANSLATION, locale()).cancel}</Button>
            <Button default classList="flex-1 text-center" onClick={removeAllHomebrew}>{localize(TRANSLATION, locale()).delete}</Button>
          </div>
        </Show>
      </Modal>
    </Show>
  );
}
