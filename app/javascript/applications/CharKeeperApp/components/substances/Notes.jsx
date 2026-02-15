import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Toggle, Button, IconButton, ErrorWrapper, TextArea } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close, Edit } from '../../assets';
import { fetchNotesRequest } from '../../requests/fetchNotesRequest';
import { createNoteRequest } from '../../requests/createNoteRequest';
import { updateNoteRequest } from '../../requests/updateNoteRequest';
import { removeNoteRequest } from '../../requests/removeNoteRequest';
import { localize, performResponse } from '../../helpers';

const TRANSLATION = {
  en: {
    textHelp: 'You can use Markdown for editing description',
    newNote: 'Add new note',
    newNoteTitle: 'Title',
    newNoteValue: 'Note text'
  },
  ru: {
    textHelp: 'Вы можете использовать Markdown для редактирования описания',
    newNote: 'Добавить новую заметку',
    newNoteTitle: 'Заголовок',
    newNoteValue: 'Текст заметки'
  },
  es: {
    textHelp: 'Puedes usar Markdown para editar la descripción.',
    newNote: 'Añadir nueva nota',
    newNoteTitle: 'Título',
    newNoteValue: 'Texto de nota'
  }
}

export const Notes = (props) => {
  const type = () => props.type || 'characters';

  const [lastActivePageId, setLastActivePageId] = createSignal(undefined);
  const [notes, setNotes] = createSignal(undefined);
  const [activeNewNoteTab, setActiveNewNoteTab] = createSignal(false);
  const [noteForm, setNoteForm] = createStore({
    title: '',
    value: ''
  });

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActivePageId() === appState.activePageParams.id) return;

    const fetchCharacterNotes = async () => await fetchNotesRequest(appState.accessToken, type(), appState.activePageParams.id);

    Promise.all([fetchCharacterNotes()]).then(
      ([characterNotesData]) => {
        batch(() => {
          setNotes(characterNotesData.notes);
          setLastActivePageId(appState.activePageParams.id);
        });
      }
    );
  });

  const addNote = () => {
    batch(() => {
      setNoteForm({ title: '', value: '' });
      setActiveNewNoteTab(true);
    });
  }

  const editNote = (note) => {
    batch(() => {
      setNoteForm({ id: note.id, title: note.title, value: note.value });
      setActiveNewNoteTab(true);
    });
  }

  const createNote = async () => {
    const result = await createNoteRequest(appState.accessToken, type(), appState.activePageParams.id, { note: noteForm });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setNotes([result.note].concat(notes()));
        cancelNote();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const updateNote = async () => {
    const result = await updateNoteRequest(appState.accessToken, type(), appState.activePageParams.id, noteForm.id, { note: noteForm });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setNotes(notes().slice().map((item) => {
          if (item.id !== noteForm.id) return item;

          return result.note;
        }));
        cancelNote();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const cancelNote = () => {
    batch(() => {
      setNoteForm({ title: '', value: '' });
      setActiveNewNoteTab(false);
    });
  }

  const removeNote = async (event, noteId) => {
    event.stopPropagation();
    const result = await removeNoteRequest(appState.accessToken, type(), appState.activePageParams.id, noteId);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setNotes(notes().filter((item) => item.id !== noteId));
      },
      function() { renderAlerts(result.errors_list) }
    );
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
                labelText={TRANSLATION[locale()].newNoteTitle}
                value={noteForm.title}
                onInput={(value) => setNoteForm({ ...noteForm, title: value })}
              />
              <TextArea
                rows="5"
                labelText={TRANSLATION[locale()].newNoteValue}
                value={noteForm.value}
                onChange={(value) => setNoteForm({ ...noteForm, value: value })}
              />
              <p class="text-sm mt-1">{localize(TRANSLATION, locale()).textHelp}</p>
            </div>
            <div class="flex justify-end mt-4">
              <Button outlined textable size="small" classList="mr-4" onClick={cancelNote}>{t('cancel')}</Button>
              <Button default textable size="small" onClick={() => noteForm.id === undefined ? createNote() : updateNote()}>
                {t('save')}
              </Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="mb-2 w-full uppercase" onClick={addNote}>
          {TRANSLATION[locale()].newNote}
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
                    class="feat-markdown"
                    innerHTML={note.markdown_value} // eslint-disable-line solid/no-innerhtml
                  />
                  <Button default classList="absolute -bottom-4 -right-4 rounded opacity-50" onClick={() => editNote(note)}>
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
