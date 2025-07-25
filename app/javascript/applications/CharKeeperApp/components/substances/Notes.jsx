import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton, ErrorWrapper, TextArea } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { Close } from '../../assets';
import { fetchCharacterNotesRequest } from '../../requests/fetchCharacterNotesRequest';
import { createCharacterNoteRequest } from '../../requests/createCharacterNoteRequest';
import { removeCharacterNoteRequest } from '../../requests/removeCharacterNoteRequest';

export const Notes = () => {
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
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
    if (lastActiveCharacterId() === appState.activePageParams.id) return;

    const fetchCharacterNotes = async () => await fetchCharacterNotesRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacterNotes()]).then(
      ([characterNotesData]) => {
        batch(() => {
          setNotes(characterNotesData.notes);
          setLastActiveCharacterId(appState.activePageParams.id);
        });
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
    <ErrorWrapper payload={{ character_id: appState.activePageParams.id, key: 'Notes' }}>
      <Show
        when={!activeNewNoteTab()}
        fallback={
          <div class="p-4 flex-1 flex flex-col blockable">
            <div class="flex-1">
              <Input
                containerClassList="mb-2"
                labelText={t('notes.newNoteTitle')}
                value={noteForm.title}
                onInput={(value) => setNoteForm({ ...noteForm, title: value })}
              />
              <TextArea
                rows="5"
                labelText={t('notes.newNoteValue')}
                value={noteForm.value}
                onChange={(value) => setNoteForm({ ...noteForm, value: value })}
              />
            </div>
            <div class="flex justify-end mt-4">
              <Button outlined textable size="small" classList="mr-4" onClick={cancelNote}>{t('cancel')}</Button>
              <Button default textable size="small" onClick={saveNote}>{t('save')}</Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="mb-2 w-full uppercase" onClick={() => setActiveNewNoteTab(true)}>
          {t('notes.newNote')}
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
    </ErrorWrapper>
  );
}
