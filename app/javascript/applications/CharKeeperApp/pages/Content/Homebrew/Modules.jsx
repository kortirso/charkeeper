import { createEffect, createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Checkbox } from '../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { fetchHomebrewModulesRequest } from '../../../requests/fetchHomebrewModulesRequest';
import { updateUserBookRequest } from '../../../requests/updateUserBookRequest';

export const HomebrewModules = (props) => {
  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const fetchBooks = async () => await fetchHomebrewModulesRequest(appState.accessToken, props.provider);

  createEffect(() => {
    if (props.homebrews === undefined) return;
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
      <p class="mb-2 dark:text-snow">{t('pages.homebrewPage.modulesHelp')}</p>
      <Show when={books() !== undefined}>
        <div class="grid grid-cols-1 emd:grid-cols-2 elg:grid-cols-3 exl:grid-cols-4 gap-x-2">
          <For each={books().sort((item) => !item.shared)}>
            {(book) =>
              <Toggle isOpen title={
                <div class="flex items-center">
                  <p class="flex-1">{book.name}</p>
                </div>
              }>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <Show when={book.items.races.length > 0}>
                      <p class="mb-2">{t(`pages.homebrewPage.${props.provider}.includedAncestries`)}</p>
                      <For each={props.homebrews.races.filter((item) => book.items.races.includes(item.id))}>
                        {(race) =>
                          <p class="flex-1">{race.name}</p>
                        }
                      </For>
                    </Show>
                    <Show when={book.items.communities.length > 0}>
                      <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedCommunities`)}</p>
                      <For each={props.homebrews.communities.filter((item) => book.items.communities.includes(item.id))}>
                        {(community) =>
                          <p class="flex-1">{community.name}</p>
                        }
                      </For>
                    </Show>
                    <Show when={book.items.subclasses.length > 0}>
                      <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedSubclasses`)}</p>
                      <For each={props.homebrews.subclasses.filter((item) => book.items.subclasses.includes(item.id))}>
                        {(subclass) =>
                          <p class="flex-1">{subclass.name}</p>
                        }
                      </For>
                    </Show>
                    <Show when={book.items.items.length > 0}>
                      <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedItems`)}</p>
                      <For each={props.homebrews.items.filter((item) => book.items.items.includes(item.id))}>
                        {(item) =>
                          <p class="flex-1">{item.name.en}</p>
                        }
                      </For>
                    </Show>
                  </Match>
                </Switch>
                <Show when={book.shared}>
                  <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow cursor-pointer">
                    <Checkbox
                      filled
                      labelText="Enabled"
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
