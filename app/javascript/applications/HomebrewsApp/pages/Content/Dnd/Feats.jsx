import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, createModal, Select, DndFeatForm, DndFeat } from '../../../components';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchFeaturesRequest } from '../../../requests/fetchFeaturesRequest';
import { createFeat } from '../../../requests/createFeat';
import { changeFeat } from '../../../requests/changeFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add feat',
    save: 'Save'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить черту',
    save: 'Сохранить'
  },
  es: {
    added: 'Contenido agregado al libro',
    selectBook: 'Seleccionar libro',
    selectBookHelp: 'Seleccione los elementos necesarios para agregar al libro',
    add: 'Agregar proesa',
    save: 'Guardar'
  }
}

export const DndFeats = () => {
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [feats, setFeats] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  const fetchFeats = async () => await fetchFeaturesRequest(appState.accessToken, 'dnd');
  const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'dnd');

  createEffect(() => {
    Promise.all([fetchFeats(), fetchBooks()]).then(
      ([featsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.own));
          setFeats(featsData.feats);
        });
      }
    );
  });

  const availableBooks = createMemo(() => {
    if (books() === undefined) return [];

    return books().filter(({ shared }) => shared === null);
  });

  const createFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'dnd', payload);

    if (result.errors_list === undefined) {
      batch(() => {
        setFeats([result.feat].concat(feats()));
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateFeature = async (id, originId, payload) => {
    const result = await changeFeat(appState.accessToken, 'dnd', id, payload);

    if (result.errors_list === undefined) {
      const newFeats = feats().map((item) => {
        if (result.feat.id !== item.id) return item;

        return { ...item, ...result.feat };
      });
      batch(() => {
        setFeats(newFeats);
        closeModal();
      });
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'dnd', feature.id);

    if (result.errors_list === undefined) {
      setFeats(feats().filter(({ id }) => id !== feature.id ));
    } else renderAlerts(result.errors_list);
  }

  const selectForBook = (feat) => {
    selectedIds().includes(feat.id) ? setSelectedIds(selectedIds().filter((id) => id !== feat.id)) : setSelectedIds(selectedIds().concat(feat.id));
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, 'dnd', book(), { ids: selectedIds(), only_head: true }, 'feat');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={feats() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openModal}>{TRANSLATION[locale()].add}</Button>
      </div>
      <Show when={feats().length > 0}>
        <Show when={availableBooks().length > 0}>
          <div class="flex items-center">
            <Select
              containerClassList="w-40"
              labelText={TRANSLATION[locale()].selectBook}
              items={Object.fromEntries(availableBooks().map((item) => [item.id, item.name]))}
              selectedValue={book()}
              onSelect={setBook}
            />
            <Show when={book() && selectedIds().length > 0}>
              <Button default classList="px-2 py-1 mt-6 ml-4" onClick={addToBook}>
                {TRANSLATION[locale()].save}
              </Button>
            </Show>
          </div>
          <p class="text-sm mt-1 mb-2">{TRANSLATION[locale()].selectBookHelp}</p>
        </Show>
        <div class="border border-gray-200 rounded border-b-0">
          <For each={feats()}>
            {(feat, index) =>
              <div class="border-b border-gray-200 rounded">
                <DndFeat
                  open={false}
                  feature={feat}
                  index={index()}
                  onRemoveFeature={removeFeature}
                  updateFeature={updateFeature}
                  showBookSelect={availableBooks().length > 0}
                  selected={selectedIds().includes(feat.id)}
                  onSelect={() => selectForBook(feat)}
                />
              </div>
            }
          </For>
        </div>
      </Show>
      <Modal>
        <DndFeatForm
          origin="feat"
          onSave={createFeature}
          onCancel={closeModal}
        />
      </Modal>
    </Show>
  );
}
