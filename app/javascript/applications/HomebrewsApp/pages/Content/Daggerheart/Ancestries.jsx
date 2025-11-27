import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Select } from '../../../components';
import { Edit, Trash, Stroke } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartAncestries } from '../../../requests/fetchDaggerheartAncestries';
import { fetchDaggerheartAncestry } from '../../../requests/fetchDaggerheartAncestry';
import { createDaggerheartAncestry } from '../../../requests/createDaggerheartAncestry';
import { changeDaggerheartAncestry } from '../../../requests/changeDaggerheartAncestry';
import { removeDaggerheartAncestry } from '../../../requests/removeDaggerheartAncestry';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add ancestry',
    newAncestryTitle: 'Ancestry form',
    name: 'Ancestry name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить расу',
    newAncestryTitle: 'Редактирование расы',
    name: 'Название расы',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartAncestries = () => {
  const [ancestryForm, setAncestryForm] = createStore({ name: '' });
  const [featureAncestry, setFeatureAncestry] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [ancestries, setAncestries] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchAncestries = async () => await fetchDaggerheartAncestries(appState.accessToken);

    Promise.all([fetchAncestries(), fetchBooks()]).then(
      ([ancestriesData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setAncestries(ancestriesData.ancestries);
        });
      }
    );
  });

  const openCreateAncestryModal = () => {
    batch(() => {
      setAncestryForm({ id: null, name: '' });
      setModalMode('ancestryForm');
      openModal();
    });
  }

  const openChangeAncestryModal = (ancestry) => {
    batch(() => {
      setAncestryForm({ id: ancestry.id, name: ancestry.name });
      setModalMode('ancestryForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (ancestry) => {
    batch(() => {
      setFeatureAncestry(ancestry);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveAncestry = () => {
    ancestryForm.id === null ? createAncestry() : updateAncestry();
  }

  const createAncestry = async () => {
    const result = await createDaggerheartAncestry(appState.accessToken, { brewery: ancestryForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setAncestries([result.ancestry].concat(ancestries()));
        setAncestryForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const updateAncestry = async () => {
    const result = await changeDaggerheartAncestry(appState.accessToken, ancestryForm.id, { brewery: ancestryForm, only_head: true });

    if (result.errors_list === undefined) {
      const newAncestries = ancestries().map((item) => {
        if (ancestryForm.id !== item.id) return item;

        return { ...item, name: ancestryForm.name };
      });

      batch(() => {
        setAncestries(newAncestries);
        setAncestryForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeAncestry = async (ancestry) => {
    const result = await removeDaggerheartAncestry(appState.accessToken, ancestry.id);

    if (result.errors_list === undefined) {
      setAncestries(ancestries().filter(({ id }) => id !== ancestry.id ));
    }
  }

  const createAncestryFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const ancestry = await fetchDaggerheartAncestry(appState.accessToken, featureAncestry().id)

      if (ancestry.errors_list === undefined) {
        const newAncestries = ancestries().map((item) => {
          if (featureAncestry().id !== item.id) return item;

          return { ...item, ...ancestry.ancestry };
        });

        batch(() => {
          setAncestries(newAncestries);
          setFeatureAncestry(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const ancestry = await fetchDaggerheartAncestry(appState.accessToken, feature.origin_value)

      if (ancestry.errors_list === undefined) {
        const newAncestries = ancestries().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...ancestry.ancestry };
        });

        setAncestries(newAncestries);
      }
    }
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'ancestry');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={ancestries() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateAncestryModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={ancestries().length > 0}>
        <div class="flex items-center">
          <Select
            containerClassList="w-40"
            labelText={TRANSLATION[locale()].selectBook}
            items={Object.fromEntries(books().filter(({ shared }) => shared === null).map((item) => [item.id, item.name]))}
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
        <div class="grid grid-cols-3 gap-4">
          <For each={ancestries()}>
            {(ancestry) =>
              <div class="blockable p-4 flex flex-col">
                <div class="flex-1">
                  <p class="font-medium! mb-4 text-xl">{ancestry.name}</p>
                  <Show when={ancestry.features.length < 2}>
                    <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(ancestry)}>
                      {TRANSLATION[locale()].addFeature}
                    </Button>
                  </Show>
                  <For each={ancestry.features}>
                    {(feature) =>
                      <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                    }
                  </For>
                </div>
                <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                   <Button
                    default
                    classList="p-2"
                    onClick={() => selectedIds().includes(ancestry.id) ? setSelectedIds(selectedIds().filter((id) => id !== ancestry.id)) : setSelectedIds(selectedIds().concat(ancestry.id))}
                  >
                    <span classList={{ 'opacity-25': !selectedIds().includes(ancestry.id) }}>
                      <Stroke width="16" height="12" />
                    </span>
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => openChangeAncestryModal(ancestry)}>
                    <Edit width="20" height="20" />
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => removeAncestry(ancestry)}>
                    <Trash width="20" height="20" />
                  </Button>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
      <Modal>
        <Show when={modalMode() === 'ancestryForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newAncestryTitle}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()].name}
            value={ancestryForm.name}
            onInput={(value) => setAncestryForm({ ...ancestryForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveAncestry}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="ancestry" originValue={featureAncestry().id} onSave={createAncestryFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
