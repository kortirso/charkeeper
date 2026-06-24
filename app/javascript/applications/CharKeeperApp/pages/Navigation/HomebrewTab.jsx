import { createSignal, createEffect, Show, For } from 'solid-js';

import { PageHeader, Toggle, Checkbox } from '../../components';
import { useAppLocale, useAppState, useAppAlert } from '../../context';
import { fetchBooksRequest, toggleBooksRequest } from '../../requests/books';
import { localize, readFromCache } from '../../helpers';

const CHARKEEPER_HOST_CACHE_NAME = 'CharKeeperHost';
const TRANSLATION = {
  en: {
    title: 'Homebrew',
    page: 'On this tab you can browse the Homebrew books that are available for various systems and change their availability.',
    link: 'The list of available books and individual homebrews can be viewed and expanded',
    here: 'here'
  },
  ru: {
    title: 'Homebrew',
    page: 'На этой вкладке вы можете ознакомиться с Homebrew книгами, которые доступны для различных систем, и изменять их доступность.',
    link: 'Список доступных книг и отдельных homebrew можно посмотреть и дополнить',
    here: 'тут'
  },
  es: {
    title: 'Homebrew',
    page: 'En esta pestaña puedes explorar los libros de Homebrew disponibles para varios sistemas y cambiar su disponibilidad.',
    link: 'La lista de libros disponibles y de cervezas artesanales individuales puede consultarse y ampliarse',
    here: 'aquí'
  }
}
const PROVIDERS = {
  daggerheart: 'Daggerheart'
}

export const HomebrewTab = () => {
  const [host, setHost] = createSignal('https://charkeeper.org/homebrews');
  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const [{ renderAlerts }] = useAppAlert();

  const readHost = async () => {
    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    const baseHost = cacheValue === null || cacheValue === undefined ? appState.rootHost : cacheValue;
    setHost(baseHost.includes('localhost') ? `http://${baseHost}/homebrews` : `https://${baseHost}/homebrews`);
  }

  createEffect(() => {
    if (books() !== undefined) return;

    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken);

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        setBooks(booksData.books);
      }
    );

    readHost();
  });

  const toggleBook = async (bookId) => {
    const result = await toggleBooksRequest(appState.accessToken, bookId );
    if (result.errors_list === undefined) {
      setBooks(
        books().map((book) => {
          if (book.id !== bookId) return book;
          return { ...book, enabled: !book.enabled };
        })
      )
    } else renderAlerts(result.errors_list);
  }

  return (
    <>
      <PageHeader>
        {localize(TRANSLATION, locale()).title}
      </PageHeader>
      <div class="p-4 flex-1 flex flex-col overflow-hidden dark:text-snow">
        <Show when={books()}>
          <p class="mb-2 text-sm">{localize(TRANSLATION, locale()).page}</p>
          <p class="mb-4 text-sm">{localize(TRANSLATION, locale()).link} <a href={host()} class='underline' target='_blank' rel='noopener noreferrer'>{localize(TRANSLATION, locale()).here}</a></p>
          <div class="flex flex-col gap-2">
            <For each={['daggerheart']}>
              {(provider) =>
                <Toggle containerClassList="mb-0!" title={PROVIDERS[provider]}>
                  <div class="flex flex-col gap-2">
                    <For each={books().filter((book) => book.provider === provider)}>
                      {(book) =>
                        <Checkbox
                          labelText={book.name}
                          labelPosition="right"
                          labelClassList="ml-2"
                          checked={book.enabled}
                          onToggle={() => toggleBook(book.id)}
                        />
                      }
                    </For>
                  </div>
                </Toggle>
              }
            </For>
          </div>
        </Show>
      </div>
    </>
  );
}

