import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, Select, createModal, Checkbox } from '../../../components';
import { Edit, Trash, Copy } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchBackgroundsRequest } from '../../../requests/fetchBackgroundsRequest';
import { createBackgroundRequest } from '../../../requests/createBackgroundRequest';
import { changeBackgroundRequest } from '../../../requests/changeBackgroundRequest';
import { removeBackgroundRequest } from '../../../requests/removeBackgroundRequest';
import { copyBackgroundRequest } from '../../../requests/copyBackgroundRequest';
import { fetchBackgroundTalentsRequest } from '../../../requests/fetchBackgroundTalentsRequest';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add background',
    newItemTitle: 'Background form',
    name: 'Background name',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Spell copy is completed',
    abilities: 'Abilities to boost (select 3)',
    skills: 'Skill expertise (select 2)',
    feats: 'Feat',
    save: 'Save',
    selectedAbilities: 'Abilities to boost',
    selectedSkills: 'Skill expertise'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить происхождение',
    newItemTitle: 'Редактирование происхождения',
    name: 'Название происхождения',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступный',
    copyCompleted: 'Копирование происхождения завершено',
    abilities: 'Характеристики для повышения (выберите 3)',
    skills: 'Владение навыками (выберите 2)',
    feats: 'Черта',
    save: 'Сохранить',
    selectedAbilities: 'Характеристики для повышения',
    selectedSkills: 'Владение навыками'
  },
  es: {
    added: 'El contenido se ha añadido al libro',
    selectBook: 'Seleccionar libro',
    selectBookHelp: 'Seleccione los elementos necesarios para agregar al libro',
    add: 'Agregar trasfondo',
    newItemTitle: 'Forma de trasfondo',
    name: 'Nombre del trasfondo',
    showPublic: 'Mostrar públicos',
    public: 'Público',
    copyCompleted: 'Copia de trasfondo completada',
    abilities: 'Habilidades para mejorar (seleccione 3)',
    skills: 'Maestría en habilidades (seleccione 2)',
    feats: 'Proesa',
    save: 'Guardar',
    selectedAbilities: 'Habilidades para mejorar',
    selectedSkills: 'Maestría en habilidades'
  }
}

export const DndBackgrounds = () => {
  const [form, setForm] = createStore({ name: '', selected_feats: [], selected_skills: [], ability_boosts: [] });
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [backgrounds, setBackgrounds] = createSignal(undefined);
  const [talents, setTalents] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'dnd');
    const fetchBackgrounds = async () => await fetchBackgroundsRequest(appState.accessToken, 'dnd');
    const fetchBackgroundTalents = async () => await fetchBackgroundTalentsRequest(appState.accessToken, 'dnd');

    Promise.all([fetchBooks(), fetchBackgrounds(), fetchBackgroundTalents()]).then(
      ([booksData, backgroundsData, talentsData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setBackgrounds(backgroundsData.backgrounds);
          setTalents(talentsData.talents.reduce((acc, item) => { acc[item.id] = item.title; return acc; }, {}));
        });
      }
    );
  });

  const filteredBackgrounds = createMemo(() => {
    if (backgrounds() === undefined) return [];

    return backgrounds().filter(({ own }) => open() ? !own : own);
  });

  const openCreateModal = () => {
    batch(() => {
      setForm({ id: null, name: '', selected_feats: [], selected_skills: [], ability_boosts: [] });
      openModal();
    });
  }

  const openChangeModal = (background) => {
    batch(() => {
      setForm({
        id: background.id, name: background.name, selected_feats: background.data.selected_feats, selected_skills: Object.keys(background.data.selected_skills), ability_boosts: background.data.ability_boosts
      });
      openModal();
    });
  }

  const updateValues = (value, key) => {
    const currentValues = form[key];
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setForm({ ...form, [key]: newValue });
  }

  const saveBackground = () => {
    const { name: name, ...data } = form; // eslint-disable-line solid/reactivity
    const formData = {
      name: name,
      data: { ...data, selected_skills: form.selected_skills.reduce((acc, item) => { acc[item] = 1; return acc; }, {}) }
    }
    form.id === null ? createBackground(formData) : updateBackground(formData);
  }

  const createBackground = async (formData) => {
    const result = await createBackgroundRequest(appState.accessToken, 'dnd', { brewery: formData });

    if (result.errors_list === undefined) {
      batch(() => {
        setBackgrounds([result.background].concat(backgrounds()));
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateBackground = async (formData) => {
    const result = await changeBackgroundRequest(appState.accessToken, 'dnd', form.id, { brewery: formData });

    if (result.errors_list === undefined) {
      const newBackgrounds = backgrounds().map((background) => {
        if (form.id !== background.id) return background;

        return result.background;
      });

      batch(() => {
        setBackgrounds(newBackgrounds);
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeBackground = async (backgroundId) => {
    const result = await removeBackgroundRequest(appState.accessToken, 'dnd', backgroundId);

    if (result.errors_list === undefined) {
      setBackgrounds(backgrounds().filter(({ id }) => id !== backgroundId ));
    } else renderAlerts(result.errors_list);
  }

  const copyBackground = async (backgroundId) => {
    const result = await copyBackgroundRequest(appState.accessToken, 'dnd', backgroundId);

    if (result.errors_list === undefined) {
      setBackgrounds([result.background].concat(backgrounds()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
    } else renderAlerts(result.errors_list);
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, 'dnd', book(), { ids: selectedIds(), only_head: true }, 'background');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={backgrounds() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredBackgrounds().length > 0}>
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
        <table class="w-full table">
          <thead>
            <tr class="text-sm">
              <td class="p-1" />
              <td class="p-1" />
              <td class="p-1">{TRANSLATION[locale()].description}</td>
              <td class="p-1" />
            </tr>
          </thead>
          <tbody>
            <For each={filteredBackgrounds()}>
              {(background) =>
                <tr>
                  <td class="minimum-width py-1">
                    <Checkbox
                      checked={selectedIds().includes(background.id)}
                      classList="mr-1"
                      innerClassList="small"
                      onToggle={() => selectedIds().includes(background.id) ? setSelectedIds(selectedIds().filter((id) => id !== background.id)) : setSelectedIds(selectedIds().concat(background.id))}
                    />
                  </td>
                  <td class="py-1">{background.name}</td>
                  <td class="py-1">
                    <p>{TRANSLATION[locale()].selectedAbilities}: {background.data.ability_boosts.map((item) => config.abilities[item].name[locale()]).join(', ')}</p>
                    <p>{TRANSLATION[locale()].selectedSkills}: {Object.keys(background.data.selected_skills).map((item) => config.skills[item].name[locale()]).join(', ')}</p>
                    <p>{TRANSLATION[locale()].feats}: {background.data.selected_feats.map((item) => talents()[item]).join(', ')}</p>
                  </td>
                  <td>
                    <div class="col-span-2 flex items-start justify-end gap-2">
                      <Show
                        when={!open()}
                        fallback={
                          <Button default classList="px-2 py-1" onClick={() => copyBackground(background.id)}>
                            <Copy width="20" height="20" />
                          </Button>
                        }
                      >
                        <Show when={filteredBackgrounds().length > 0}>
                          <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                            <Button default classList="px-2 py-1" onClick={() => openChangeModal(background)}>
                              <Edit width="20" height="20" />
                            </Button>
                            <Button default classList="px-2 py-1" onClick={() => removeBackground(background.id)}>
                              <Trash width="20" height="20" />
                            </Button>
                          </div>
                        </Show>
                      </Show>
                    </div>
                  </td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </Show>
      <Modal>
        <p class="text-xl">{TRANSLATION[locale()].newItemTitle}</p>
        <Input
          containerClassList="form-field mt-2"
          labelText={TRANSLATION[locale()].name}
          value={form.name}
          onInput={(value) => setForm({ ...form, name: value })}
        />
        <Select
          multi
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].abilities}
          items={translate(config.abilities, locale())}
          selectedValues={form.ability_boosts}
          onSelect={(value) => updateValues(value, 'ability_boosts')}
        />
        <Select
          multi
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].skills}
          items={translate(config.skills, locale())}
          selectedValues={form.selected_skills}
          onSelect={(value) => updateValues(value, 'selected_skills')}
        />
        <Select
          relative
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].feats}
          items={talents()}
          selectedValue={form.selected_feats[0]}
          onSelect={(value) => setForm({ ...form, selected_feats: [value] })}
        />
        <Checkbox
          labelText={TRANSLATION[locale()].public}
          labelPosition="right"
          labelClassList="ml-2"
          checked={form.public}
          classList="mt-4"
          onToggle={() => setForm({ ...form, public: !form.public })}
        />
        <Button default classList="mt-4 px-2 py-1" onClick={saveBackground}>{TRANSLATION[locale()].save}</Button>
      </Modal>
    </Show>
  );
}
