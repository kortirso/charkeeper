import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, createModal, DaggerheartFeatForm, DaggerheartFeat, Select, Checkbox } from '../../../components';
import { Edit, Trash, Stroke, Copy } from '../../../assets';
import { fetchHomebrewsList } from '../../../requests/fetchHomebrewsList';
import { fetchDaggerheartBooks } from '../../../requests/fetchDaggerheartBooks';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchDaggerheartSubclasses } from '../../../requests/fetchDaggerheartSubclasses';
import { fetchDaggerheartSubclass } from '../../../requests/fetchDaggerheartSubclass';
import { createDaggerheartSubclass } from '../../../requests/createDaggerheartSubclass';
import { changeDaggerheartSubclass } from '../../../requests/changeDaggerheartSubclass';
import { removeDaggerheartSubclass } from '../../../requests/removeDaggerheartSubclass';
import { copyDaggerheartSubclass } from '../../../requests/copyDaggerheartSubclass';
import { createFeat } from '../../../requests/createFeat';
import { removeFeat } from '../../../requests/removeFeat';
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
    public: 'Общедоступная',
    copyCompleted: 'Копирование подкласса завершено'
  }
}

export const DaggerheartSubclasses = () => {
  const [subclassForm, setSubclassForm] = createStore({
    name: '',
    mechanics: [],
    spellcast: null,
    class_name: null,
    public: false
  });
  const [featureSubclass, setFeatureSubclass] = createSignal(undefined);
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [subclasses, setSubclasses] = createSignal(undefined);
  const [modalMode, setModalMode] = createSignal(undefined);
  const [homebrews, setHomebrews] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  const fetchSubclasses = async () => await fetchDaggerheartSubclasses(appState.accessToken);

  createEffect(() => {
    const fetchBooks = async () => await fetchDaggerheartBooks(appState.accessToken);
    const fetchHomebrews = async () => await fetchHomebrewsList(appState.accessToken, 'daggerheart');

    Promise.all([fetchSubclasses(), fetchHomebrews(), fetchBooks()]).then(
      ([subclassesData, homebrewsData, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setSubclasses(subclassesData.subclasses);
          setHomebrews(homebrewsData);
        });
      }
    );
  });

  const filteredSubclasses = createMemo(() => {
    if (subclasses() === undefined) return [];

    return subclasses().filter(({ own }) => open() ? !own : own);
  });

  const daggerheartClasses = createMemo(() => {
    const result = translate(config.classes, locale());
    if (homebrews() === undefined) return result;

    return { ...result, ...homebrews().classes.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  const openCreateSubclassModal = () => {
    batch(() => {
      setSubclassForm({ id: null, name: '', class_name: null, spellcast: null, mechanics: [], public: false });
      setModalMode('subclassForm');
      openModal();
    });
  }

  const openChangeSubclassModal = (subclass) => {
    batch(() => {
      setSubclassForm({ id: subclass.id, name: subclass.name, class_name: subclass.class_name, spellcast: subclass.spellcast, mechanics: subclass.mechanics, public: subclass.public });
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

  const updateMultiFeatureValue = (value) => {
    const currentValues = subclassForm.mechanics;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setSubclassForm({ ...subclassForm, mechanics: newValue });
  }

  const saveSubclass = () => {
    subclassForm.id === null ? createSubclass() : updateSubclass();
  }

  const createSubclass = async () => {
    const result = await createDaggerheartSubclass(appState.accessToken, { brewery: subclassForm });

    if (result.errors_list === undefined) {
      batch(() => {
        setSubclasses([result.subclass].concat(subclasses()));
        setSubclassForm({ id: null, name: '', mechanics: [], spellcast: null, class_name: null, public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateSubclass = async () => {
    const result = await changeDaggerheartSubclass(appState.accessToken, subclassForm.id, { brewery: subclassForm, only_head: true });

    if (result.errors_list === undefined) {
      const newSubclasses = subclasses().map((item) => {
        if (subclassForm.id !== item.id) return item;

        return { ...item, name: subclassForm.name };
      });

      batch(() => {
        setSubclasses(newSubclasses);
        setSubclassForm({ id: null, name: '', mechanics: [], spellcast: null, class_name: null, public: false });
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeSubclass = async (subclass) => {
    const result = await removeDaggerheartSubclass(appState.accessToken, subclass.id);

    if (result.errors_list === undefined) {
      setSubclasses(subclasses().filter(({ id }) => id !== subclass.id ));
    } else renderAlerts(result.errors_list);
  }

  const copySubclass = async (subclassId) => {
    const result = await copyDaggerheartSubclass(appState.accessToken, subclassId);
    const subclass = await fetchDaggerheartSubclass(appState.accessToken, result.subclass.id)
    if (subclass.errors_list === undefined) {
      setSubclasses([subclass.subclass].concat(subclasses()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
    }
  }

  const createSubclassFeature = async (payload) => {
    const result = await createFeat(appState.accessToken, 'daggerheart', payload);

    if (result.errors_list === undefined) {
      const subclass = await fetchDaggerheartSubclass(appState.accessToken, featureSubclass().id)

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
    }
  }

  const removeFeature = async (feature) => {
    const result = await removeFeat(appState.accessToken, 'daggerheart', feature.id);

    if (result.errors_list === undefined) {
      const subclass = await fetchDaggerheartSubclass(appState.accessToken, feature.origin_value)

      if (subclass.errors_list === undefined) {
        const newSubclasses = subclasses().map((item) => {
          if (feature.origin_value !== item.id) return item;

          return { ...item, ...subclass.subclass };
        });

        setSubclasses(newSubclasses);
      }
    }
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'subclass');

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
          <For each={filteredSubclasses()}>
            {(subclass) =>
              <div class="blockable p-4 flex flex-col">
                <div class="flex-1">
                  <p class="font-medium! mb-2 text-xl">{subclass.name}</p>
                  <p class="mb-1">{TRANSLATION[locale()].originClass} - {daggerheartClasses()[subclass.class_name]}</p>
                  <Show when={subclass.spellcast}>
                    <p class="mb-1">{TRANSLATION[locale()].spellcast} - {config.traits[subclass.spellcast].name[locale()]}</p>
                  </Show>
                  <Show when={subclass.mechanics.length > 0}>
                    <p class="mb-1">{TRANSLATION[locale()].mechanics} - {subclass.mechanics.map((item) => config.mechanics[item].name[locale()]).join(', ')}</p>
                  </Show>
                  <Button default small classList="mt-3 mb-2 p-1" onClick={() => openCreateFeatureModal(subclass)}>
                    {TRANSLATION[locale()].addFeature}
                  </Button>
                  <For each={subclass.features}>
                    {(feature) =>
                      <DaggerheartFeat feature={feature} onRemoveFeature={removeFeature} />
                    }
                  </For>
                </div>
                <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                  <Show
                    when={!open()}
                    fallback={
                      <Button default classList="px-2 py-1" onClick={() => copySubclass(subclass.id)}>
                        <Copy width="20" height="20" />
                      </Button>
                    }
                  >
                    <Button
                      default
                      classList="p-2"
                      onClick={() => selectedIds().includes(subclass.id) ? setSelectedIds(selectedIds().filter((id) => id !== subclass.id)) : setSelectedIds(selectedIds().concat(subclass.id))}
                    >
                      <span classList={{ 'opacity-25': !selectedIds().includes(subclass.id) }}>
                        <Stroke width="16" height="12" />
                      </span>
                    </Button>
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
            containerClassList="flex-1 mb-2"
            labelText={TRANSLATION[locale()].originClass}
            items={daggerheartClasses()}
            selectedValue={subclassForm.class_name}
            onSelect={(value) => setSubclassForm({ ...subclassForm, class_name: value })}
          />
          <Select
            containerClassList="flex-1 mb-2"
            labelText={TRANSLATION[locale()].spellcast}
            items={translate(config.traits, locale())}
            selectedValue={subclassForm.spellcast}
            onSelect={(value) => setSubclassForm({ ...subclassForm, spellcast: value })}
          />
          <Select
            multi
            containerClassList="mb-4"
            labelText={TRANSLATION[locale()].mechanics}
            items={translate(config.mechanics, locale())}
            selectedValues={subclassForm.mechanics}
            onSelect={(value) => updateMultiFeatureValue(value)}
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
        <Show when={modalMode() === 'featureForm'}>
          <DaggerheartFeatForm origin="subclass" originValue={featureSubclass().id} onSave={createSubclassFeature} onCancel={closeModal} />
        </Show>
      </Modal>
    </Show>
  );
}
