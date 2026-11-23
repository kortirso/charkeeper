import { createMemo, createSignal, createEffect, Switch, Match, Show, For } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';
import { DragDropProvider } from '@dnd-kit/solid';

import { NewCharacterForm } from '../layouts';
import { Button, createSheet, LayoutNavButtonSortable } from '../components';
import { useAppLocale, useAppState } from '../context';
import { localize, apiRequest, options } from '../helpers';

const TRANSLATION = {
  en: {
    createCharacter: 'Create character',
    noCharacters: 'You do not have any characters yet. Create one to start playing.',
    level: 'Level'
  },
  ru: {
    createCharacter: 'Создать персонажа',
    noCharacters: 'У вас пока нет персонажей. Создайте первого, чтобы начать игру.',
    level: 'Уровень'
  },
  es: {
    createCharacter: 'Crear personaje',
    noCharacters: 'Todavía no tienes personajes. Crea uno para empezar a jugar.',
    level: 'Nivel'
  }
}

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/characters.json',
    options: options('GET', accessToken)
  });
}

export const createReorderRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/characters/reorder.json',
    options: options('POST', accessToken, payload)
  });
}

export const CharactersLayout = () => {
  const [characters, setCharacters] = createSignal(undefined);
  const [currentCharacter, setCurrentCharacter] = createSignal(null);

  const size = createWindowSize();
  const [locale] = useAppLocale();
  const [appState] = useAppState();
  const { Sheet, openSheet, closeSheet } = createSheet();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  createEffect(() => {
    if (currentCharacter()) return;
    if (characters() !== undefined) return;

    const fetchCharacters = async () => await fetchCharactersRequest(appState.accessToken);

    Promise.all([fetchCharacters()]).then(
      ([charactersData]) => {
        setCharacters(charactersData.characters);
      }
    );
  });

  const reorderCharacters = (event) => {
    if (event.canceled) return;

    const { initialIndex, index } = event.operation.source;
    if (initialIndex === index) return;
    if (!characters()?.[initialIndex] || !characters()[index]) return;

    const reorderedCharacters = [...characters()];

    // удаляет перемещаемый элемент с начальной позиции
    const [movedCharacter] = reorderedCharacters.splice(initialIndex, 1);
    // добавляет перемещаемый элемент на конечную позицию
    reorderedCharacters.splice(index, 0, movedCharacter);

    setCharacters(reorderedCharacters);

    createReorderRequest(appState.accessToken, {
      character_ids: reorderedCharacters.map((character) => character.id)
    });
  }

  const description = (character) => {
    if (character.provider === 'pathfinder2') return `${i18n().level} ${character.level} | ${character.names.race_name}`;
    if (character.provider === 'daggerheart') return `${i18n().level} ${character.level} | ${character.names.ancestry_name}`;
  };

  const additional = (character) => {
    if (character.provider === 'pathfinder2') return character.names.class_name;
    if (character.provider === 'daggerheart') return Object.keys(character.names.subclass_names).join(' * ');
  };

  return (
    <div id="content-body">
      <Switch>
        <Match when={characters() && characters().length === 0}>
          <Show when={size.width >= 1280}>
            <div id="content-body-left">
              <div class="empty-character-state">
                <p class="empty-character-state-text">{i18n().noCharacters}</p>
                <Button onClick={openSheet}>{i18n().createCharacter}</Button>
              </div>
            </div>
          </Show>
          <div id="content-body-right">
            <Show when={size.width < 1280}>
              <div class="empty-character-state">
                <p class="empty-character-state-text">{i18n().noCharacters}</p>
                <Button onClick={openSheet}>{i18n().createCharacter}</Button>
              </div>
            </Show>
          </div>
        </Match>
        <Match when={characters() && !currentCharacter() && characters().length > 0}>
          <div id="content-body-left">
            <DragDropProvider onDragEnd={reorderCharacters}>
              <For each={characters()}>
                {(character, index) =>
                  <LayoutNavButtonSortable
                    draggable
                    id={character.id}
                    index={index()}
                    avatar={character.avatar}
                    title={character.name}
                    description={description(character)}
                    additional={additional(character)}
                    onClick={() => setCurrentCharacter(character)}
                  />
                }
              </For>
            </DragDropProvider>
          </div>
          <Show when={size.width >= 1280}>
            <div id="content-body-right" />
          </Show>
        </Match>
      </Switch>
      <Sheet title={i18n().createCharacter}>
        <NewCharacterForm onCancel={closeSheet} />
      </Sheet>
    </div>
  );
}
