import { createMemo, Show } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { NewCharacterForm } from '../layouts';
import { Button, createSheet } from '../components';
import { useAppLocale } from '../context';
import { localize } from '../helpers';

const TRANSLATION = {
  en: {
    createCharacter: 'Create character',
    noCharacters: 'You do not have any characters yet. Create one to start playing.'
  },
  ru: {
    createCharacter: 'Создать персонажа',
    noCharacters: 'У вас пока нет персонажей. Создайте первого, чтобы начать игру.'
  },
  es: {
    createCharacter: 'Crear personaje',
    noCharacters: 'Todavía no tienes personajes. Crea uno para empezar a jugar.'
  }
}

export const CharactersLayout = () => {
  const size = createWindowSize();
  const [locale] = useAppLocale();
  const { Sheet, openSheet, closeSheet } = createSheet();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  return (
    <div id="content-body">
      <div id="content-body-left">
        <Show when={size.width >= 1280}>
          <div class="empty-character-state">
            <p class="empty-character-state-text">{i18n().noCharacters}</p>
            <Button onClick={openSheet}>{i18n().createCharacter}</Button>
          </div>
        </Show>
      </div>
      <div id="content-body-right">
        <Show when={size.width < 1280}>
          <div class="empty-character-state">
            <p class="empty-character-state-text">{i18n().noCharacters}</p>
            <Button onClick={openSheet}>{i18n().createCharacter}</Button>
          </div>
        </Show>
      </div>
      <Sheet title={i18n().createCharacter}>
        <NewCharacterForm onCancel={closeSheet} />
      </Sheet>
    </div>
  );
}
