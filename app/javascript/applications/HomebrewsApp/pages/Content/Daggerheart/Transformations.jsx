import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Select } from '../../../components';
import { Edit, Trash, Stroke } from '../../../assets';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartTransformations } from '../../../requests/fetchDaggerheartTransformations';
import { fetchDaggerheartTransformation } from '../../../requests/fetchDaggerheartTransformation';
import { createDaggerheartTransformation } from '../../../requests/createDaggerheartTransformation';
import { changeDaggerheartTransformation } from '../../../requests/changeDaggerheartTransformation';
import { removeDaggerheartTransformation } from '../../../requests/removeDaggerheartTransformation';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add transformation',
    newTransformationTitle: 'Transformation form',
    name: 'Transformation name',
    save: 'Save',
    addFeature: 'Add feature'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить трансформацию',
    newTransformationTitle: 'Редактирование трансформации',
    name: 'Название трансформации',
    save: 'Сохранить',
    addFeature: 'Добавить способность'
  }
}

export const DaggerheartTransformations = () => {
  const [transformationForm, setTransformationForm] = createStore({ name: '' });
  const [featureTransformation, setFeatureTransformation] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [transformations, setTransformations] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchTransformations = async () => await fetchDaggerheartTransformations(appState.accessToken);

    Promise.all([fetchTransformations(), fetchBooks()]).then(
      ([transformationsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setTransformations(transformationsData.transformations);
        });
      }
    );
  });

  const openCreateTransformationModal = () => {
    batch(() => {
      setTransformationForm({ id: null, name: '' });
      setModalMode('transformationForm');
      openModal();
    });
  }

  const openChangeTransformationModal = (transformation) => {
    batch(() => {
      setTransformationForm({ id: transformation.id, name: transformation.name });
      setModalMode('transformationForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (transformation) => {
    batch(() => {
      setFeatureTransformation(transformation);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveTransformation = () => {
    transformationForm.id === null ? createTransformation() : updateTransformation();
  }

  const createTransformation = async () => {
    const result = await createDaggerheartTransformation(appState.accessToken, { brewery: transformationForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setTransformations([result.transformation].concat(transformations()));
        setTransformationForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const updateTransformation = async () => {
    const result = await changeDaggerheartTransformation(appState.accessToken, transformationForm.id, { brewery: transformationForm, only_head: true });

    if (result.errors_list === undefined) {
      const newTransformations = transformations().map((item) => {
        if (transformationForm.id !== item.id) return item;

        return { ...item, name: transformationForm.name };
      });

      batch(() => {
        setTransformations(newTransformations);
        setTransformationForm({ id: null, name: '' });
        closeModal();
      });
    }
  }

  const removeTransformation = async (transformation) => {
    const result = await removeDaggerheartTransformation(appState.accessToken, transformation.id);

    if (result.errors_list === undefined) {
      setTransformations(transformations().filter(({ id }) => id !== transformation.id ));
    }
  }

  const createTransformationFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const transformation = await fetchDaggerheartTransformation(appState.accessToken, featureTransformation().id)

      if (transformation.errors_list === undefined) {
        const newTransformations = transformations().map((item) => {
          if (featureTransformation().id !== item.id) return item;

          return { ...item, ...transformation.transformation };
        });

        batch(() => {
          setTransformations(newTransformations);
          setFeatureTransformation(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const transformation = await fetchDaggerheartTransformation(appState.accessToken, feature.origin_value)

      if (transformation.errors_list === undefined) {
        const newTransformations = transformations().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...transformation.transformation };
        });

        setTransformations(newTransformations);
      }
    }
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'transformation');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={transformations() !== undefined} fallback={<></>}>
      <Button default classList="mb-4 px-2 py-1" onClick={openCreateTransformationModal}>{TRANSLATION[locale()].add}</Button>
      <Show when={transformations().length > 0}>
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
          <For each={transformations()}>
            {(transformation) =>
              <div class="blockable p-4 flex flex-col">
                <div class="flex-1">
                  <p class="font-medium! mb-4 text-xl">{transformation.name}</p>
                  <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(transformation)}>
                    {TRANSLATION[locale()].addFeature}
                  </Button>
                  <For each={transformation.features}>
                    {(feature) =>
                      <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                    }
                  </For>
                </div>
                <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                  <Button
                    default
                    classList="p-2"
                    onClick={() => selectedIds().includes(transformation.id) ? setSelectedIds(selectedIds().filter((id) => id !== transformation.id)) : setSelectedIds(selectedIds().concat(transformation.id))}
                  >
                    <span classList={{ 'opacity-25': !selectedIds().includes(transformation.id) }}>
                      <Stroke width="16" height="12" />
                    </span>
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => openChangeTransformationModal(transformation)}>
                    <Edit width="20" height="20" />
                  </Button>
                  <Button default classList="px-2 py-1" onClick={() => removeTransformation(transformation)}>
                    <Trash width="20" height="20" />
                  </Button>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
      <Modal>
        <Show when={modalMode() === 'transformationForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newTransformationTitle}</p>
          <Input
            containerClassList="form-field mb-4"
            labelText={TRANSLATION[locale()].name}
            value={transformationForm.name}
            onInput={(value) => setTransformationForm({ ...transformationForm, name: value })}
          />
          <Button default classList="px-2 py-1" onClick={saveTransformation}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="transformation" originValue={featureTransformation().id} onSave={createTransformationFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
