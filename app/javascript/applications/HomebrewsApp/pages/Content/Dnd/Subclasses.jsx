import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, Select, Checkbox, DndFeatForm, DndFeat } from '../../../components';
import { Edit, Trash, Stroke, Copy, Plus } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchSubclassesRequest } from '../../../requests/fetchSubclassesRequest';
import { fetchSubclassRequest } from '../../../requests/fetchSubclassRequest';
import { createSubclassRequest } from '../../../requests/createSubclassRequest';
import { updateSubclassRequest } from '../../../requests/updateSubclassRequest';
import { deleteSubclassRequest } from '../../../requests/deleteSubclassRequest';
import { copySubclassRequest } from '../../../requests/copySubclassRequest';
import { createFeat } from '../../../requests/createFeat';
import { changeFeat } from '../../../requests/changeFeat';
import { removeFeat } from '../../../requests/removeFeat';
import { fetchSpellsRequest } from '../../../requests/fetchSpellsRequest';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add subclass',
    newSubclassTitle: 'Subclass form',
    name: 'Subclass name',
    save: 'Save',
    addFeature: 'Add feature',
    originClass: 'Origin class',
    spellcast: 'Spellcast trait',
    mechanics: 'Mechanics',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Subclass copy is completed'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить подкласс',
    newSubclassTitle: 'Редактирование подкласса',
    name: 'Название подкласса',
    save: 'Сохранить',
    addFeature: 'Добавить способность',
    originClass: 'Класс',
    spellcast: 'Магическая характеристика',
    mechanics: 'Доступные механики',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступный',
    copyCompleted: 'Копирование подкласса завершено'
  }
}

export const DndSubclasses = () => {
  const [subclassForm, setSubclassForm] = createStore({
    name: '',
    class_name: null,
    public: false
  });
  const [featureSubclass, setFeatureSubclass] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [spells, setSpells] = createSignal(undefined);
  const [books, setBooks] = createSignal(undefined);
  const [subclasses, setSubclasses] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  const fetchSubclasses = async () => await fetchSubclassesRequest(appState.accessToken, 'dnd');
  const fetchSpells = async () => await fetchSpellsRequest(appState.accessToken, 'dnd2024');

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'dnd');

    Promise.all([fetchSubclasses(), fetchBooks(), fetchSpells()]).then(
      ([subclassesData, booksData, spellsData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.own));
          setSubclasses(subclassesData.subclasses);
          setSpells(Object.fromEntries(spellsData.spells.map((item) => [item.slug, item.title])));
        });
      }
    );
  });

  const availableBooks = createMemo(() => {
    if (books() === undefined) return [];

    return books().filter(({ shared }) => shared === null);
  });

  const filteredSubclasses = createMemo(() => {
    if (subclasses() === undefined) return [];

    return subclasses().filter(({ own }) => open() ? !own : own);
  });

  const dndClasses = createMemo(() => {
    return translate(config.classes, locale());
  });

  const openCreateSubclassModal = () => {
    batch(() => {
      setSubclassForm({ id: null, name: '', class_name: null, public: false });
      setModalMode('subclassForm');
      openModal();
    });
  }

  const openChangeSubclassModal = (subclass) => {
    batch(() => {
      setSubclassForm({ id: subclass.id, name: subclass.name, class_name: subclass.class_name, public: subclass.public });
      setModalMode('subclassForm');
      openModal();
    });
  }

  const openCreateFeatureModal = (subclass) => {
    batch(() => {
      setFeatureSubclass(subclass);
      setModalMode('featureForm');
      openModal();
    });
  }

  const saveSubclass = () => {
    subclassForm.id === null ? createSubclass() : updateSubclass();
  }

  const createSubclass = async () => {
    const result = await createSubclassRequest(appState.accessToken, 'dnd', { brewery: subclassForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setSubclasses([result.subclass].concat(subclasses()));
        setSubclassForm({ id: null, name: '', class_name: null, public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateSubclass = async () => {
    const result = await updateSubclassRequest(appState.accessToken, 'dnd', subclassForm.id, { brewery: subclassForm, only_head: true });

    if (result.errors_list === undefined) {
      const newSubclasses = subclasses().map((item) => {
        if (subclassForm.id !== item.id) return item;

        return { ...item, ...subclassForm };
      });

      batch(() => {
        setSubclasses(newSubclasses);
        setSubclassForm({ id: null, name: '', class_name: null, public: false, own: true });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeSubclass = async (subclass) => {
    const result = await deleteSubclassRequest(appState.accessToken, 'dnd', subclass.id);

    if (result.errors_list === undefined) {
      setSubclasses(subclasses().filter(({ id }) => id !== subclass.id ));
    } else renderAlerts(result.errors_list);
  }

  const copySubclass = async (subclassId) => {
    const result = await copySubclassRequest(appState.accessToken, 'dnd', subclassId);
    const subclass = await fetchSubclassRequest(appState.accessToken, 'dnd', result.subclass.id)
    if (subclass.errors_list === undefined) {
      setSubclasses([subclass.subclass].concat(subclasses()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
    } else renderAlerts(result.errors_list);
  }

  const createSubclassFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'dnd', payload);

    if (result.errors_list === undefined) {
      const subclass = await fetchSubclassRequest(appState.accessToken, 'dnd', featureSubclass().id)

      if (subclass.errors_list === undefined) {
        const newSubclasses = subclasses().map((item) => {
          if (featureSubclass().id !== item.id) return item;

          return { ...item, ...subclass.subclass };
        });

        batch(() => {
          setSubclasses(newSubclasses);
          setFeatureSubclass(undefined);
          setModalMode(undefined);
          closeModal();
        });
      }
    } else renderAlerts(result.errors_list);
  }

  const updateFeature = async (id, originId, payload) => {
    const result = await changeFeat(appState.accessToken, 'dnd', id, payload);

    if (result.errors_list === undefined) {
      const subclass = await fetchSubclassRequest(appState.accessToken, 'dnd', originId)

      if (subclass.errors_list === undefined) {
        const newSubclasses = subclasses().map((item) => {
          if (originId !== item.id) return item;

          return { ...item, ...subclass.subclass };
        });

        batch(() => {
          setSubclasses(newSubclasses);
          closeModal();
        });
      }
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'dnd', feature.id);

    if (result.errors_list === undefined) {
      const subclass = await fetchSubclassRequest(appState.accessToken, 'dnd', feature.origin_value)

      if (subclass.errors_list === undefined) {
        const newSubclasses = subclasses().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...subclass.subclass };
        });

        setSubclasses(newSubclasses);
      }
    } else renderAlerts(result.errors_list);
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, 'dnd', book(), { ids: selectedIds(), only_head: true }, 'subclass');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={subclasses() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateSubclassModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredSubclasses().length > 0}>
        <Show when={!open() && availableBooks().length > 0}>
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
          <For each={filteredSubclasses()}>
            {(subclass) =>
              <div class="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 rounded">
                <div class="col-span-3">
                  <p class="text-xl">{subclass.name}</p>
                  <p class="mb-1">{TRANSLATION[locale()].originClass} - {dndClasses()[subclass.class_name]}</p>
                </div>
                <div class="col-span-7">
                  <Button default small classList="mb-2 p-1" onClick={() => openCreateFeatureModal(subclass)}>
                    <Plus width="20" height="20" />
                  </Button>
                  <For each={subclass.features.sort((a, b) => a.conditions.level > b.conditions.level)}>
                    {(feature, index) =>
                      <div class="mb-2">
                        <DndFeat
                          open={open()}
                          feature={feature}
                          index={index()}
                          originId={subclass.id}
                          spells={spells()}
                          onRemoveFeature={removeFeature}
                          updateFeature={updateFeature}
                        />
                      </div>
                    }
                  </For>
                </div>
                <div class="col-span-2 flex items-start justify-end gap-2">
                  <Show
                    when={!open()}
                    fallback={
                      <Button default classList="px-2 py-1" onClick={() => copySubclass(subclass.id)}>
                        <Copy width="20" height="20" />
                      </Button>
                    }
                  >
                    <Show when={availableBooks().length > 0}>
                      <Button
                        default
                        classList="p-2"
                        onClick={() => selectedIds().includes(subclass.id) ? setSelectedIds(selectedIds().filter((id) => id !== subclass.id)) : setSelectedIds(selectedIds().concat(subclass.id))}
                      >
                        <span classList={{ 'opacity-25': !selectedIds().includes(subclass.id) }}>
                          <Stroke width="16" height="12" />
                        </span>
                      </Button>
                    </Show>
                    <Button default classList="px-2 py-1" onClick={() => openChangeSubclassModal(subclass)}>
                      <Edit width="20" height="20" />
                    </Button>
                    <Button default classList="px-2 py-1" onClick={() => removeSubclass(subclass)}>
                      <Trash width="20" height="20" />
                    </Button>
                  </Show>
                </div>
              </div>
            }
          </For>
        </div>
      </Show>
      <Modal>
        <Show when={modalMode() === 'subclassForm'}>
          <p class="mb-2 text-xl">{TRANSLATION[locale()].newSubclassTitle}</p>
          <Input
            containerClassList="form-field mb-2"
            labelText={TRANSLATION[locale()].name}
            value={subclassForm.name}
            onInput={(value) => setSubclassForm({ ...subclassForm, name: value })}
          />
          <Select
            relative
            containerClassList="flex-1 mb-2"
            labelText={TRANSLATION[locale()].originClass}
            items={dndClasses()}
            selectedValue={subclassForm.class_name}
            onSelect={(value) => setSubclassForm({ ...subclassForm, class_name: value })}
          />
          <Checkbox
            labelText={TRANSLATION[locale()].public}
            labelPosition="right"
            labelClassList="ml-2"
            checked={subclassForm.public}
            classList="mb-4"
            onToggle={() => setSubclassForm({ ...subclassForm, public: !subclassForm.public })}
          />
          <Button default classList="px-2 py-1" onClick={saveSubclass}>
            {TRANSLATION[locale()].save}
          </Button>
        </Show>
        <Show when={modalMode() === 'featureForm' && spells()}>
          <DndFeatForm
            origin="subclass"
            spells={spells()}
            originValue={featureSubclass().id}
            onSave={createSubclassFeature}
            onCancel={closeModal}
          />
        </Show>
      </Modal>
    </Show>
  );
}
