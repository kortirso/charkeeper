import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Toggle, Button, Checkbox, Input } from '../../components';
import { Trash } from '../../assets';
import { changeUserBook, createBookRequest } from '../../requests_v2/books';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    add: 'Create',
    showPublic: 'Show public',
    enabled: 'Enabled',
    disabled: 'Disabled',
    name: 'Book name',
    save: 'Save',
    public: 'Public'
  },
  ru: {
    add: 'Добавить',
    showPublic: 'Показать общедоступные',
    enabled: 'Подключено',
    disabled: 'Отключено',
    name: 'Название книги',
    save: 'Сохранить',
    public: 'Общедоступная'
  },
  es: {
    add: 'Agregar',
    showPublic: 'Mostrar públicos',
    enabled: 'Habilitado',
    disabled: 'Deshabilitado',
    name: 'Nombre del libro',
    save: 'Guardar',
    public: 'Público'
  }
}

export const SharedBookContent = (props) => {
  const ChildrenComponent = props.childrenComponent; // eslint-disable-line solid/reactivity

  const [elements, setElements] = createSignal(undefined);
  const [bookForm, setBookForm] = createStore({ name: '', public: false });

  const [createMode, setCreateMode] = createSignal(false);
  const [ownFilter, setOwnFilter] = createSignal(true);

  const [infos, setInfos] = createSignal({});
  const [openInfos, setOpenInfos] = createSignal({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    Promise.all([props.onFetchRequest()]).then(
      ([elementsData]) => {
        setElements(elementsData.homebrews);
      }
    );
  });

  const filtered = createMemo(() => {
    if (elements() === undefined) return [];

    return elements().filter(({ own }) => ownFilter() ? own : !own);
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

  const toggleBook = async (bookId) => {
    const result = await changeUserBook(appState.accessToken, bookId);

    if (result.errors_list === undefined) {
      setElements(elements().map((item) => {
        if (item.id !== bookId) return item;

        return { ...item, enabled: !item.enabled };
      }));
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
            <Button default classList="px-2 py-1" onClick={createBook}>{localize(TRANSLATION, locale()).save}</Button>
          </>
        }
      >
        <Show when={filtered().length > 0}>
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
                        <Show when={ownFilter()}>
                          <div class="flex items-center justify-end gap-1 text-neutral-700">
                            <Button default classList="px-2 py-1" onClick={(e) => remove(e, element.id)}>
                              <Trash width="20" height="20" />
                            </Button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  }
                >
                  <Show when={infos()[element.id]}>
                    <ChildrenComponent info={infos()[element.id]} />
                    <Show when={element.shared || !element.own}>
                      <p class="mt-2 py-1 cursor-pointer">
                        <Checkbox
                          labelText={element.enabled ? localize(TRANSLATION, locale()).enabled : localize(TRANSLATION, locale()).disabled}
                          labelPosition="right"
                          labelClassList="ml-2"
                          checked={element.enabled}
                          classList="mr-1"
                          onToggle={() => toggleBook(element.id)}
                        />
                      </p>
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
