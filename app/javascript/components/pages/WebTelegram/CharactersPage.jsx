import { createSignal, createEffect, For, Switch, Match, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { CharacterLink, CharacterView } from '../../../components';

import { useAppState, useAppLocale } from '../../../context';
import { fetchCharactersRequest } from '../../../requests/fetchCharactersRequest';

export const CharactersPage = () => {
  const [characters, setCharacters] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (characters() !== undefined) return;

    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchCharacters()]).then(
      ([charactersData]) => {
        setCharacters(charactersData.characters);
      }
    );
  });

  // 453x750
  // 420x690
  return (
    <Switch>
      <Match when={Object.keys(appState.activePageParams).length === 0}>
        <div class="w-full flex justify-between py-4 bg-white border-b border-gray">
          <p class="flex-1 text-center">{t('characters.title')}</p>
        </div>
        <div class="p-4">
          <Show when={characters() !== undefined}>
            <For each={characters()}>
              {(character) =>
                <CharacterLink character={character} />
              }
            </For>
          </Show>
        </div>
      </Match>
      <Match when={appState.activePageParams.id}>
        <CharacterView />
      </Match>
    </Switch>
  );
}
