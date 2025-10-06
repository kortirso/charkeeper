import { createEffect, createSignal, Switch, Match, Show, For } from 'solid-js';

import { Toggle, Checkbox } from '../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewModulesRequest } from '../../../requests/fetchHomebrewModulesRequest';
import { updateUserBookRequest } from '../../../requests/updateUserBookRequest';

const TRANSLATION = {
  en: {
    races: 'Ancestries',
    communities: 'Communities',
    subclasses: 'Subclasses',
    items: 'Items',
    transformations: 'Transformations',
    modulesHelp: 'Page content can be edited by bot command',
    enabled: 'Enabled'
  },
  ru: {
    races: 'Расы',
    communities: 'Общества',
    subclasses: 'Подклассы',
    items: 'Предметы',
    transformations: 'Трансформации',
    modulesHelp: 'Контент раздела может редактироваться через бот команды',
    enabled: 'Подключено'
  }
}

export const HomebrewModules = (props) => {
  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchBooks = async () => await fetchHomebrewModulesRequest(appState.accessToken, props.provider);

  createEffect(() => {
    if (books() !== undefined) return;

    Promise.all([fetchBooks()]).then(
      ([booksData]) => {
        if (booksData.errors) setBooks([]);
        else setBooks(booksData.books);
      }
    );
  });

  const toggleBook = async (bookId) => {
    const result = await updateUserBookRequest(appState.accessToken, bookId);

    if (result.errors_list === undefined) {
      setBooks(books().map((item) => {
        if (item.id !== bookId) return item;

        return { ...item, enabled: !item.enabled };
      }));
    } else renderAlerts(result.errors_list);
  }

  return (
    <div class="p-2 flex-1 overflow-y-auto">
      <p class="mb-2 dark:text-snow">{TRANSLATION[locale()].modulesHelp}</p>
      <Show when={books() !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 gap-x-2">
          <For each={books().sort((item) => !item.shared)}>
            {(book) =>
              <Toggle isOpen title={
                <div class="flex items-center">
                  <p class="flex-1">{book.name}</p>
                </div>
              }>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <div class="grid grid-cols-1 emd:grid-cols-2 gap-x-2 gap-y-8">
                      <For each={['races', 'communities', 'subclasses', 'items', 'transformations']}>
                        {(kind) =>
                          <Show when={book.items[kind].length > 0}>
                            <div>
                              <p class="mb-2">{TRANSLATION[locale()][kind]}</p>
                              <For each={book.items[kind]}>
                                {(item) =>
                                  <p class="flex-1">{item}</p>
                                }
                              </For>
                            </div>
                          </Show>
                        }
                      </For>
                    </div>
                  </Match>
                </Switch>
                <Show when={book.shared}>
                  <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer">
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
              </Toggle>
            }
          </For>
        </div>
      </Show>
    </div>
  );
}
