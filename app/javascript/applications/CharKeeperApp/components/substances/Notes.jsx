import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton, ErrorWrapper, TextArea } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { Close, Edit } from '../../assets';
import { fetchCharacterNotesRequest } from '../../requests/fetchCharacterNotesRequest';
import { createCharacterNoteRequest } from '../../requests/createCharacterNoteRequest';
import { updateCharacterNoteRequest } from '../../requests/updateCharacterNoteRequest';
import { removeCharacterNoteRequest } from '../../requests/removeCharacterNoteRequest';

export const Notes = () => {
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [notes, setNotes] = createSignal(undefined);
  const [activeNewNoteTab, setActiveNewNoteTab] = createSignal(false);
  const [noteForm, setNoteForm] = createStore({
    title: '',
    value: ''
  });
  const [editNoteId, setEditNoteId] = createSignal(undefined);

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

  const saveNote = async () => {
    const result = await createCharacterNoteRequest(appState.accessToken, appState.activePageParams.id, { note: noteForm });

    if (result.errors === undefined) {
      setNotes([result.note].concat(notes()));
      cancelNote();
    }
  }

  const editNote = (note) => {
    batch(() => {
      setNoteForm({ title: note.title, value: note.value });
      setEditNoteId(note.id);
      setActiveNewNoteTab(true);
    });
  }

  const updateNote = async () => {
    const result = await updateCharacterNoteRequest(
      appState.accessToken, appState.activePageParams.id, editNoteId(), { note: noteForm, only_head: true }
    );

    if (result.errors === undefined) {
      setNotes(notes().slice().map((item) => {
        if (item.id !== editNoteId()) return item;

        return { ...item, ...noteForm };
      }));
      cancelNote();
    }
  }

  const cancelNote = () => {
    batch(() => {
      setEditNoteId(undefined);
      setActiveNewNoteTab(false);
      setNoteForm({ title: '', value: '' });
    });
  }

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
              <Button
                default
                textable
                size="small"
                onClick={() => editNoteId() === undefined ? saveNote() : updateNote()}
              >{t('save')}</Button>
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
                <div class="relative">
                  <p
                    class="text-sm"
                    innerHTML={note.value} // eslint-disable-line solid/no-innerhtml
                  />
                  <Button
                    default
                    classList="absolute -bottom-4 -right-4 rounded opacity-50"
                    onClick={() => editNote(note)}
                  >
                    <Edit width={20} height={20} />
                  </Button>
                </div>
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </ErrorWrapper>
  );
}
