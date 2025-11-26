import { createSignal, createEffect, Show, For } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Checkbox } from '../../../components';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeDaggerheartBook } from '../../../requests/changeDaggerheartBook';

const TRANSLATION = {
  en: {
    races: 'Ancestries',
    communities: 'Communities',
    subclasses: 'Subclasses',
    items: 'Items',
    transformations: 'Transformations',
    domains: 'Domains',
    enabled: 'Enabled'
  },
  ru: {
    races: 'Расы',
    communities: 'Общества',
    subclasses: 'Подклассы',
    items: 'Предметы',
    transformations: 'Трансформации',
    domains: 'Домены',
    enabled: 'Подключено'
  }
}

export const DaggerheartBooks = () => {
  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (books() !== undefined) return;

    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        setBooks(booksData.books);
      }
    );
  });

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
      <div class="blockable p-4">
        <For each={books().sort((item) => !item.shared)}>
          {(book) =>
            <>
              <p class="mb-2 text-xl font-medium!">{book.name}</p>
              <For each={['races', 'communities', 'subclasses', 'items', 'transformations', 'domains']}>
                {(kind) =>
                  <Show when={book.items[kind].length > 0}>
                    <div class="mb-4">
                      <p class="font-regular! mb-2">{TRANSLATION[locale()][kind]}</p>
                      <p>{book.items[kind].join(', ')}</p>
                    </div>
                  </Show>
                }
              </For>
              <Show when={book.shared}>
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
            </>
          }
        </For>
      </div>
    </Show>
  );
}

