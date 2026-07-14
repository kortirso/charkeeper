import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Toggle, Button, Checkbox, Input } from '../../components';
import { Trash, Edit, Like } from '../../assets';
import { changeUserBook, createBookRequest, changeBookRequest } from '../../requests_v2/books';
import { removeBookItemRequest } from '../../requests_v2/bookItems';
import { changeUserUpvote } from '../../requests_v2/upvotes';

import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    add: 'Create',
    showPublic: 'Only public',
    enabled: 'Enabled',
    disabled: 'Disabled',
    name: 'Book name',
    save: 'Save',
    public: 'Public',
    editMode: 'Edit books content'
  },
  ru: {
    add: 'Добавить',
    showPublic: 'Только общедоступные',
    enabled: 'Подключено',
    disabled: 'Отключено',
    name: 'Название книги',
    save: 'Сохранить',
    public: 'Общедоступная',
    editMode: 'Режим редактирования книг'
  },
  es: {
    add: 'Agregar',
    showPublic: 'Mostrar públicos',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    name: 'Nombre del libro',
    save: 'Guardar',
    public: 'Público',
    editMode: 'Edit books content'
  }
}

export const SharedBookContent = (props) => {
  const ChildrenComponent = props.childrenComponent; // eslint-disable-line solid/reactivity

  const [elements, setElements] = createSignal(undefined);
  const [bookForm, setBookForm] = createStore({ name: '', public: false });

  const [createMode, setCreateMode] = createSignal(false);
  const [ownFilter, setOwnFilter] = createSignal(true);
  const [editMode, setEditMode] = createSignal(false);

  const [infos, setInfos] = createSignal({});
  const [openInfos, setOpenInfos] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    Promise.all([props.onFetchRequest()]).then(
      ([elementsData]) => {
        setElements(elementsData.homebrews.sort((a, b) => b.own - a.own || b.upvotes_count - a.upvotes_count));
      }
    );
  });

  const filtered = createMemo(() => {
    if (elements() === undefined) return [];
    if (!ownFilter()) return elements().filter(({ own }) => !own);

    return elements();
  });

  const showInfo = async (element) => {
    if (infos()[element.id]) {
      setOpenInfos({ ...openInfos(), [element.id]: !openInfos()[element.id] })
    } else {
      const result = await props.onShowRequest(appState.accessToken, element.id);
      if (result.errors_list === undefined) {
        batch(() => {
          setInfos({ ...infos(), [element.id]: result.homebrew });
          setOpenInfos({ ...openInfos(), [element.id]: true });
        });
      } else renderAlerts(result.errors_list);
    }
  }

  const remove = async (e, id) => {
    e.stopPropagation();

    const result = await props.onRemoveRequest(appState.accessToken, id);
    if (result.errors_list === undefined) {
      setElements(elements().filter((item) => item.id !== id ));
    } else renderAlerts(result.errors_list);
  }

  const edit = async (e, element) => {
    e.stopPropagation();

    batch(() => {
      setCreateMode(true);
      setBookForm({ id: element.id, name: element.title, public: element.public });
    });
  }

  const performBook = () => bookForm.id ? updateBook() : createBook();

  const createBook = async () => {
    const result = await createBookRequest(appState.accessToken, props.provider, { book: bookForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setElements([result.book].concat(elements()));
        setBookForm({ id: null, name: '', public: false });
        setCreateMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  const updateBook = async () => {
    const result = await changeBookRequest(appState.accessToken, props.provider, bookForm.id, { book: bookForm, only_head: true });

    if (result.errors_list === undefined) {
      batch(() => {
        setElements(
          elements().map((item) => {
            if (bookForm.id !== item.id) return item;

            return { ...item, title: bookForm.name, public: bookForm.public };
          })
        );
        setBookForm({ id: null, name: '', public: false });
        setCreateMode(false);
      });
    } else renderAlerts(result.errors_list);
  }

  const toggleBook = async (bookId) => {
    const result = await changeUserBook(appState.accessToken, bookId);

    if (result.errors_list === undefined) {
      setElements(elements().map((item) => {
        if (item.id !== bookId) return item;

        return { ...item, enabled: !item.enabled };
      }));
    } else renderAlerts(result.errors_list);
  }

  const removeItem = async (bookId, id) => {
    const removeResult = await removeBookItemRequest(appState.accessToken, bookId, id);

    if (removeResult.errors_list === undefined) {
      const result = await props.onShowRequest(appState.accessToken, bookId);
      if (result.errors_list === undefined) {
        setInfos({ ...infos(), [bookId]: result.homebrew });
      } else renderAlerts(result.errors_list);
    } else renderAlerts(removeResult.errors_list);
  }

  const like = async (e, element) => {
    e.stopPropagation();

    const result = await changeUserUpvote(appState.accessToken, element.id, 'Homebrew::Book');
    if (result.errors_list === undefined) {
      setElements(
        elements().map((item) => {
          if (item.id !== element.id) return item;

          return { ...item, upvotes_count: (item.upvoted ? item.upvotes_count - 1 : item.upvotes_count + 1), upvoted: !item.upvoted }
        })
      );
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={elements() !== undefined} fallback={<></>}>
      <div class="flex my-4">
        <div class="flex-1">
          <Button default classList="px-2 py-1" onClick={() => setCreateMode(true)}>{localize(TRANSLATION, locale()).add}</Button>
          <Button default active={!ownFilter()} classList="ml-4 px-2 py-1" onClick={() => setOwnFilter(!ownFilter())}>{localize(TRANSLATION, locale()).showPublic}</Button>
        </div>
      </div>
      <Show
        when={!createMode()}
        fallback={
          <>
            <Input
              containerClassList="form-field mb-4"
              labelText={localize(TRANSLATION, locale()).name}
              value={bookForm.name}
              onInput={(value) => setBookForm({ ...bookForm, name: value })}
            />
            <Checkbox
              labelText={localize(TRANSLATION, locale()).public}
              labelPosition="right"
              labelClassList="ml-2"
              checked={bookForm.public}
              classList="mb-4"
              onToggle={() => setBookForm({ ...bookForm, public: !bookForm.public })}
            />
            <Button default classList="px-2 py-1" onClick={performBook}>{localize(TRANSLATION, locale()).save}</Button>
          </>
        }
      >
        <Show when={filtered().length > 0}>
          <div class="flex flex-col gap-2">
            <Show when={ownFilter()}>
              <Checkbox
                labelText={localize(TRANSLATION, locale()).editMode}
                labelPosition="right"
                labelClassList="ml-2"
                checked={editMode()}
                onToggle={() => setEditMode(!editMode())}
              />
            </Show>
            <For each={filtered()}>
              {(element) =>
                <Toggle
                  disabled
                  onParentClick={() => showInfo(element)}
                  isOpenByParent={openInfos()[element.id]}
                  title={
                    <div class="flex items-center">
                      <div class="flex-1 flex flex-col gap-2">
                        <p class="text-xl font-medium!">{element.title}</p>
                        <Show when={element.public}>
                          <p class="text-sm">{localize(TRANSLATION, locale()).public}</p>
                        </Show>
                        <Show when={element.description}>
                          <p
                            class="feat-markdown mt-1"
                            innerHTML={element.description} // eslint-disable-line solid/no-innerhtml
                          />
                        </Show>
                      </div>
                      <div class="flex flex-col items-end justify-between gap-2">
                        <Show when={element.own}>
                          <div class="flex gap-2">
                            <div class="flex items-center justify-end gap-1 text-neutral-700">
                              <Button default classList="px-2 py-1" onClick={(e) => edit(e, element.id)}>
                                <Edit width="20" height="20" />
                              </Button>
                              <Button default classList="px-2 py-1" onClick={(e) => remove(e, element.id)}>
                                <Trash width="20" height="20" />
                              </Button>
                            </div>
                          </div>
                        </Show>
                        <div class="flex items-center gap-2">
                          <Button
                            outlined
                            classList={`${element.upvoted ? '' : 'opacity-25'}`}
                            onClick={(e) => like(e, element)}
                          >
                            <Like width="24" height="24" />
                          </Button>
                          <span>{element.upvotes_count}</span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <Show when={infos()[element.id]}>
                    <ChildrenComponent
                      id={element.id}
                      info={infos()[element.id]}
                      editMode={element.own && editMode()}
                      onRemove={removeItem}
                    />
                    <Show when={element.shared || !element.own}>
                      <Checkbox
                        labelText={element.enabled ? localize(TRANSLATION, locale()).enabled : localize(TRANSLATION, locale()).disabled}
                        labelPosition="right"
                        labelClassList="ml-2"
                        checked={element.enabled}
                        classList="mt-2"
                        onToggle={() => toggleBook(element.id)}
                      />
                    </Show>
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
