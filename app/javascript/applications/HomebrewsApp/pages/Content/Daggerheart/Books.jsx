import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Checkbox, Button, Input, createModal } from '../../../components';
import { Trash } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeDaggerheartBook } from '../../../requests/changeDaggerheartBook';
import { createDaggerheartBook } from '../../../requests/createDaggerheartBook';
import { removeDaggerheartBook } from '../../../requests/removeDaggerheartBook';

const TRANSLATION = {
  en: {
    add: 'Add book',
    races: 'Ancestries',
    communities: 'Communities',
    subclasses: 'Subclasses',
    items: 'Items',
    transformations: 'Transformations',
    domains: 'Domains',
    enabled: 'Enabled',
    newBookTitle: 'Book form',
    name: 'Book name',
    save: 'Save',
    official: 'Approved'
  },
  ru: {
    add: 'Добавить книгу',
    races: 'Расы',
    communities: 'Общества',
    subclasses: 'Подклассы',
    items: 'Предметы',
    transformations: 'Трансформации',
    domains: 'Домены',
    enabled: 'Подключено',
    newBookTitle: 'Редактирование книги',
    name: 'Название книги',
    save: 'Сохранить',
    official: 'Одобренная'
  }
}

export const DaggerheartBooks = () => {
  const [bookForm, setBookForm] = createStore({ name: '' });

  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    if (books() !== undefined) return;

    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        setBooks(booksData.books.sort((a, b) => {
          if (a.shared !== b.shared) return a.shared - b.shared;

          return a.own - b.own;
        }));
      }
    );
  });

  const openCreateBookModal = () => {
    batch(() => {
      setBookForm({ id: null, name: '' });
      openModal();
    });
  }

  const createBook = async () => {
    const result = await createDaggerheartBook(appState.accessToken, { brewery: bookForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setBooks([result.book].concat(books()));
        setBookForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeBook = async (book) => {
    const result = await removeDaggerheartBook(appState.accessToken, book.id);

    if (result.errors_list === undefined) {
      setBooks(books().filter(({ id }) => id !== book.id ));
    }
  }

  const toggleBook = async (bookId) => {
    const result = await changeDaggerheartBook(appState.accessToken, bookId);

    if (result.errors_list === undefined) {
      setBooks(books().map((item) => {
        if (item.id !== bookId) return item;

        return { ...item, enabled: !item.enabled };
      }));
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={books() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateBookModal}>{TRANSLATION[locale()].add}</Button>
      <div class="grid grid-cols-1 emd:grid-cols-2 gap-4">
        <For each={books().sort((item) => !item.shared)}>
          {(book) =>
            <div class="blockable p-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-xl font-medium!">{book.name}</p>
                <Show when={book.shared}>
                  <p class="font-medium!">{TRANSLATION[locale()].official}</p>
                </Show>
              </div>
              <For each={['races', 'communities', 'subclasses', 'items', 'transformations', 'domains']}>
                {(kind) =>
                  <Show when={book.items[kind].length > 0}>
                    <div class="mb-4">
                      <p class="font-medium! mb-2">{TRANSLATION[locale()][kind]}</p>
                      <p>{book.items[kind].join(', ')}</p>
                    </div>
                  </Show>
                }
              </For>
              <Show when={book.shared || !book.own}>
                <p class="px-2 py-1 dark:text-snow cursor-pointer">
                  <Checkbox
                    filled
                    labelText={TRANSLATION[locale()].enabled}
                    labelPosition="right"
                    labelClassList="ml-2"
                    checked={book.enabled}
                    classList="mr-1"
                    onToggle={() => toggleBook(book.id)}
                  />
                </p>
              </Show>
              <Show when={book.own}>
                <Button default classList="px-2 py-1" onClick={() => removeBook(book)}>
                  <Trash width="20" height="20" />
                </Button>
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
        <Button default classList="px-2 py-1" onClick={createBook}>
          {TRANSLATION[locale()].save}
        </Button>
      </Modal>
    </Show>
  );
}

