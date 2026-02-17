import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Checkbox, Button, Input, createModal } from '../../../components';
import { Trash, Edit } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookRequest } from '../../../requests/books/changeBookRequest';
import { createBookRequest } from '../../../requests/books/createBookRequest';
import { removeBookRequest } from '../../../requests/books/removeBookRequest';
import { changeUserBook } from '../../../requests/changeUserBook';

const TRANSLATION = {
  en: {
    add: 'Add book',
    races: 'Ancestries',
    communities: 'Communities',
    classes: 'Classes',
    items: 'Items',
    transformations: 'Transformations',
    domains: 'Domains',
    enabled: 'Enabled',
    disabled: 'Disabled',
    newBookTitle: 'Book form',
    name: 'Book name',
    save: 'Save',
    official: 'Approved',
    showPublic: 'Show public',
    public: 'Public'
  },
  ru: {
    add: 'Добавить книгу',
    races: 'Расы',
    communities: 'Общества',
    classes: 'Классы',
    items: 'Предметы',
    transformations: 'Трансформации',
    domains: 'Домены',
    enabled: 'Подключено',
    disabled: 'Отключено',
    newBookTitle: 'Редактирование книги',
    name: 'Название книги',
    save: 'Сохранить',
    official: 'Одобренная',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступная'
  }
}

export const DaggerheartBooks = () => {
  const [bookForm, setBookForm] = createStore({ name: '', public: false });

  const [books, setBooks] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    if (books() !== undefined) return;

    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'daggerheart');

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        setBooks(booksData.books.sort((a, b) => {
          if (a.shared !== b.shared) return a.shared - b.shared;

          return a.own - b.own;
        }));
      }
    );
  });

  const filteredBooks = createMemo(() => {
    if (books() === undefined) return [];

    return books().filter(({ own, shared, enabled }) => open() ? (!own && !shared) : (own || shared || enabled));
  });

  const openCreateBookModal = () => {
    batch(() => {
      setBookForm({ id: null, name: '', public: false });
      openModal();
    });
  }

  const openChangeBookModal = (book) => {
    batch(() => {
      setBookForm({ id: book.id, name: book.name, public: book.public });
      openModal();
    });
  }

  const saveBook = () => {
    bookForm.id === null ? createBook() : updateBook();
  }

  const createBook = async () => {
    const result = await createBookRequest(appState.accessToken, 'daggerheart', { brewery: bookForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setBooks([result.book].concat(books()));
        setBookForm({ id: null, name: '', public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateBook = async () => {
    const result = await changeBookRequest(appState.accessToken, 'daggerheart', bookForm.id, { brewery: bookForm, only_head: true });

    if (result.errors_list === undefined) {
      const newBooks = books().map((item) => {
        if (bookForm.id !== item.id) return item;

        return { ...item, name: bookForm.name, public: bookForm.public };
      });

      batch(() => {
        setBooks(newBooks);
        setBookForm({ id: null, name: '', own: true, public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeBook = async (book) => {
    const result = await removeBookRequest(appState.accessToken, 'daggerheart', book.id);

    if (result.errors_list === undefined) {
      setBooks(books().filter(({ id }) => id !== book.id ));
    } else renderAlerts(result.errors_list);
  }

  const toggleBook = async (bookId) => {
    const result = await changeUserBook(appState.accessToken, bookId);

    if (result.errors_list === undefined) {
      setBooks(books().map((item) => {
        if (item.id !== bookId) return item;

        return { ...item, enabled: !item.enabled };
      }));
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={books() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateBookModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <div class="grid grid-cols-1 emd:grid-cols-2 gap-4">
        <For each={filteredBooks().sort((item) => !item.shared)}>
          {(book) =>
            <div class="blockable p-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xl font-medium!">{book.name}</p>
                <Show when={book.shared}>
                  <p class="font-medium!">{TRANSLATION[locale()].official}</p>
                </Show>
              </div>
              <For each={['races', 'communities', 'classes', 'items', 'transformations', 'domains']}>
                {(kind) =>
                  <Show
                    when={kind !== 'classes'}
                    fallback={
                      <Show when={Object.keys(book.items.classes).length > 0}>
                        <div class="mb-4">
                          <p class="font-medium! mb-2">{TRANSLATION[locale()][kind]}</p>
                          <For each={Object.entries(book.items.classes)}>
                            {([className, subclasses]) =>
                              <p>{className} - {subclasses.join(', ')}</p>
                            }
                          </For>
                        </div>
                      </Show>
                    }
                  >
                    <Show when={book.items[kind].length > 0}>
                      <div class="mb-4">
                        <p class="font-medium! mb-2">{TRANSLATION[locale()][kind]}</p>
                        <p>{book.items[kind].join(', ')}</p>
                      </div>
                    </Show>
                  </Show>
                }
              </For>
              <Show when={book.shared || !book.own}>
                <p class="py-1 cursor-pointer">
                  <Checkbox
                    labelText={book.enabled ? TRANSLATION[locale()].enabled : TRANSLATION[locale()].disabled}
                    labelPosition="right"
                    labelClassList="ml-2"
                    checked={book.enabled}
                    classList="mr-1"
                    onToggle={() => toggleBook(book.id)}
                  />
                </p>
              </Show>
              <Show when={book.own}>
                <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                  <Button default classList="px-2 py-1" onClick={() => openChangeBookModal(book)}>
                    <Edit width="20" height="20" />
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => removeBook(book)}>
                    <Trash width="20" height="20" />
                  </Button>
                </div>
              </Show>
            </div>
          }
        </For>
      </div>
      <Modal>
        <p class="mb-2 text-xl">{TRANSLATION[locale()].newBookTitle}</p>
        <Input
          containerClassList="form-field mb-4"
          labelText={TRANSLATION[locale()].name}
          value={bookForm.name}
          onInput={(value) => setBookForm({ ...bookForm, name: value })}
        />
        <Checkbox
          labelText={TRANSLATION[locale()].public}
          labelPosition="right"
          labelClassList="ml-2"
          checked={bookForm.public}
          classList="mb-4"
          onToggle={() => setBookForm({ ...bookForm, public: !bookForm.public })}
        />
        <Button default classList="px-2 py-1" onClick={saveBook}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}

