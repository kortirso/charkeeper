import { createMemo, createSignal, createEffect, For, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { LayoutNavButton, BackToListButton, Checkbox } from '../components';
import { CosmereSystem, DaggerheartSystem, DndSystem, NimbleSystem, PathfinderSystem } from '../assets';
import { useAppLocale, useAppState } from '../context';
import { localize, apiRequest, options, performResponse } from '../helpers';

const TRANSLATION = {
  en: {
    page: 'On this tab you can browse the Homebrew books that are available for various systems and change their availability.',
    link: 'The list of available books and individual homebrews can be viewed and expanded',
    here: 'here'
  },
  ru: {
    page: 'На этой вкладке вы можете ознакомиться с Homebrew книгами, которые доступны для различных систем, и изменять их доступность.',
    link: 'Список доступных книг и отдельных homebrew можно посмотреть и дополнить',
    here: 'тут'
  },
  es: {
    page: 'En esta pestaña puedes explorar los libros de Homebrew disponibles para varios sistemas y cambiar su disponibilidad.',
    link: 'La lista de libros disponibles y de cervezas artesanales individuales puede consultarse y ampliarse',
    here: 'aquí'
  }
}
const PROVIDERS = {
  daggerheart: { title: 'Daggerheart', icon: DaggerheartSystem },
  dnd: { title: 'D&D 5.5', icon: DndSystem },
  pathfinder2: { title: 'Pathfinder 2', icon: PathfinderSystem },
  nimble: { title: 'Nimble', icon: NimbleSystem },
  cosmere: { title: 'Cosmere', icon: CosmereSystem }
}

const fetchBooksRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/homebrews/books.json',
    options: options('GET', accessToken)
  });
}

const toggleBooksRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}

export const HomebrewsLayout = () => {
  const [activeTab, setActiveTab] = createSignal(undefined);
  const [books, setBooks] = createSignal(undefined);

  const size = createWindowSize();
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  createEffect(() => {
    if (books() !== undefined) return;

    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken);

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        setBooks(booksData.books);
      }
    );
  });

  const toggleBook = async (bookId) => {
    const result = await toggleBooksRequest(appState.accessToken, bookId);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setBooks(
          books().map((book) => {
            if (book.id !== bookId) return book;
            return { ...book, enabled: !book.enabled };
          })
        )
      }
    );
  }

  return (
    <div id="content-body">
      <Show when={size.width >= 1280 || !activeTab()}>
        <div id="content-body-left">
          <p class="mb-2">{i18n().page}</p>
          <Show when={books()}>
            <For each={Object.entries(PROVIDERS)}>
              {([key, provider]) =>
                <LayoutNavButton icon={provider.icon} title={provider.title} active={activeTab() === key} onClick={() => setActiveTab(key)} />
              }
            </For>
          </Show>
        </div>
      </Show>
      <Show when={size.width >= 1280 || activeTab()}>
        <div id="content-body-right">
          <Show when={size.width < 1280}>
            <BackToListButton onClick={() => setActiveTab(undefined)} />
          </Show>
          <Show when={books()}>
            <div class="gapped-column">
              <p>{i18n().link} <a href={`https://${location.host}/homebrews`} class="underline" target="_blank" rel="noopener noreferrer">{i18n().here}</a></p>
              <For each={books().filter((book) => book.provider === activeTab()).sort((a, b) => a.name.localeCompare(b.name))}>
                {(book) =>
                  <Checkbox
                    checked={book.enabled}
                    label={book.name}
                    onChange={() => toggleBook(book.id)}
                  />
                }
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}
