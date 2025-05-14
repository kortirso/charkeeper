import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton } from '../../../atoms';

import { useAppState, useAppLocale } from '../../../../context';
import { Close } from '../../../../assets';
import { fetchCharacterNotesRequest } from '../../../../requests/fetchCharacterNotesRequest';
import { createCharacterNoteRequest } from '../../../../requests/createCharacterNoteRequest';
import { removeCharacterNoteRequest } from '../../../../requests/removeCharacterNoteRequest';

export const Dnd5Notes = () => {
  const [notes, setNotes] = createSignal(undefined);
  const [activeNewNoteTab, setActiveNewNoteTab] = createSignal(false);
  const [noteForm, setNoteForm] = createStore({
    title: '',
    value: ''
  });

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (notes() !== undefined) return;

    const fetchCharacterNotes = async () => await fetchCharacterNotesRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacterNotes()]).then(
      ([characterNotesData]) => {
        setNotes(characterNotesData.notes);
      }
    );
  });

  // actions
  const saveNote = async () => {
    const result = await createCharacterNoteRequest(appState.accessToken, appState.activePageParams.id, { note: noteForm });

    if (result.errors === undefined) {
      batch(() => {
        setNotes([result.note].concat(notes()));
        setActiveNewNoteTab(false);
        setNoteForm({ title: '', value: '' });
      })
    }
  }

  const cancelNote = () => setActiveNewNoteTab(false);

  const removeNote = async (event, noteId) => {
    event.stopPropagation();

    const result = await removeCharacterNoteRequest(appState.accessToken, appState.activePageParams.id, noteId);
    if (result.errors === undefined) setNotes(notes().filter((item) => item.id !== noteId));
  }

  return (
    <>
      <Show
        when={!activeNewNoteTab()}
        fallback={
          <div class="p-4 flex-1 flex flex-col white-box">
            <div class="flex-1">
              <Input
                containerClassList="mb-2"
                labelText={t('character.newNoteTitle')}
                value={noteForm.title}
                onInput={(value) => setNoteForm({ ...noteForm, title: value })}
              />
              <label class="text-sm/4 font-cascadia-light text-gray-400">{t('character.newNoteValue')}</label>
              <textarea
                rows="5"
                class="w-full border border-gray-200 rounded p-1 text-sm"
                onInput={(e) => setNoteForm({ ...noteForm, value: e.target.value })}
                value={noteForm.value}
              />
            </div>
            <div class="flex justify-end mt-4">
              <Button default textable size="small" classList="mr-4" onClick={cancelNote}>{t('cancel')}</Button>
              <Button default textable size="small" onClick={saveNote}>{t('save')}</Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="mb-4 w-full uppercase" onClick={() => setActiveNewNoteTab(true)}>
          {t('character.newNote')}
        </Button>
        <Show when={notes() !== undefined}>
          <For each={notes()}>
            {(note) =>
              <Toggle title={
                <div class="flex items-center">
                  <p class="flex-1">{note.title}</p>
                  <IconButton onClick={(e) => removeNote(e, note.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <p
                  class="text-sm"
                  innerHTML={note.value} // eslint-disable-line solid/no-innerhtml
                />
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
