import { createEffect, createSignal, Switch, Match, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle } from '../../../components';
import { useAppState, useAppLocale } from '../../../context';
import { fetchHomebrewModulesRequest } from '../../../requests/fetchHomebrewModulesRequest';

export const HomebrewModules = (props) => {
  const [books, setBooks] = createSignal(undefined);

  const [appState] = useAppState();
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

  return (
    <div class="p-2 flex-1 overflow-y-scroll">
      <p class="mb-2 dark:text-snow">{t('pages.homebrewPage.modulesHelp')}</p>
      <Show when={books() !== undefined}>
        <For each={books()}>
          {(book) =>
            <Toggle isOpen title={
              <div class="flex items-center">
                <p class="flex-1">{book.name}</p>
              </div>
            }>
              <Show when={book.items.races.length > 0}>
                <Switch>
                  <Match when={props.provider === 'daggerheart'}>
                    <p class="mb-2">{t(`pages.homebrewPage.${props.provider}.includedAncestries`)}</p>
                    <For each={props.homebrews.races.filter((item) => book.items.races.includes(item.id))}>
                      {(race) =>
                        <p class="flex-1">{race.name}</p>
                      }
                    </For>
                    <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedCommunities`)}</p>
                    <For each={props.homebrews.communities.filter((item) => book.items.communities.includes(item.id))}>
                      {(community) =>
                        <p class="flex-1">{community.name}</p>
                      }
                    </For>
                    <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedSubclasses`)}</p>
                    <For each={props.homebrews.subclasses.filter((item) => book.items.subclasses.includes(item.id))}>
                      {(subclass) =>
                        <p class="flex-1">{subclass.name}</p>
                      }
                    </For>
                    <p class="mt-8 mb-2">{t(`pages.homebrewPage.${props.provider}.includedItems`)}</p>
                    <For each={props.homebrews.items.filter((item) => book.items.items.includes(item.id))}>
                      {(item) =>
                        <p class="flex-1">{item.name.en}</p>
                      }
                    </For>
                  </Match>
                </Switch>
              </Show>
            </Toggle>
          }
        </For>
      </Show>
    </div>
  );
}
