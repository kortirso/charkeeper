import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, Select, Checkbox, Toggle, TextArea } from '../../../components';
import { Edit, Trash, Copy, Stroke } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchBackgroundsRequest } from '../../../requests/fetchBackgroundsRequest';
import { createBackgroundRequest } from '../../../requests/createBackgroundRequest';
import { changeBackgroundRequest } from '../../../requests/changeBackgroundRequest';
import { removeBackgroundRequest } from '../../../requests/removeBackgroundRequest';
import { copyBackgroundRequest } from '../../../requests/copyBackgroundRequest';
import { fetchBackgroundTalentsRequest } from '../../../requests/fetchBackgroundTalentsRequest';
import { translate, localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add background',
    newItemTitle: 'Background form',
    name: 'Background name',
    descriptions: 'Description',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Spell copy is completed',
    abilities: 'Abilities to boost (select 3)',
    skills: 'Skill expertise (select 2)',
    feats: 'Feat',
    save: 'Save',
    cancel: 'Cancel',
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
    descriptions: 'Описание',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступный',
    copyCompleted: 'Копирование происхождения завершено',
    abilities: 'Характеристики для повышения (выберите 3)',
    skills: 'Владение навыками (выберите 2)',
    feats: 'Черта',
    save: 'Сохранить',
    cancel: 'Отменить',
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
    descriptions: 'Description',
    showPublic: 'Mostrar públicos',
    public: 'Público',
    copyCompleted: 'Copia de trasfondo completada',
    abilities: 'Habilidades para mejorar (seleccione 3)',
    skills: 'Maestría en habilidades (seleccione 2)',
    feats: 'Proesa',
    save: 'Guardar',
    cancel: 'Cancel',
    selectedAbilities: 'Habilidades para mejorar',
    selectedSkills: 'Maestría en habilidades'
  }
}

export const DndBackgrounds = () => {
  const [form, setForm] = createStore({
    names: { en: '', ru: '', es: '' }, descriptions: { en: '', ru: '', es: '' }, selected_feats: [], selected_skills: [], ability_boosts: []
  });
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);
  const [formLocale, setFormLocale] = createSignal('en');

  const [books, setBooks] = createSignal(undefined);
  const [backgrounds, setBackgrounds] = createSignal(undefined);
  const [talents, setTalents] = createSignal(undefined);
  
  const [open, setOpen] = createSignal(false);
  const [ownFilter, setOwnFilter] = createSignal(true);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

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

    return backgrounds().filter(({ own }) => ownFilter() ? own : !own);
  });

  const onSelect = (e, backgroundId) => {
    e.stopPropagation();

    selectedIds().includes(backgroundId) ? setSelectedIds(selectedIds().filter((id) => id !== backgroundId)) : setSelectedIds(selectedIds().concat(backgroundId));
  }

  const openCreateForm = () => {
    batch(() => {
      setForm({ id: null, names: { en: '', ru: '', es: '' }, descriptions: { en: '', ru: '', es: '' }, selected_feats: [], selected_skills: [], ability_boosts: [] });
      setOpen(true);
    });
  }

  const openEditForm = (background) => {
    batch(() => {
      setForm({
        id: background.id, names: background.data.names, descriptions: background.data.descriptions, selected_feats: background.data.selected_feats, selected_skills: Object.keys(background.data.selected_skills), ability_boosts: background.data.ability_boosts
      });
      setOpen(true);
    });
  }

  const updateValues = (value, key) => {
    const currentValues = form[key];
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setForm({ ...form, [key]: newValue });
  }

  const saveBackground = () => {
    const formData = {
      name: form.names.en,
      data: { ...form, selected_skills: form.selected_skills.reduce((acc, item) => { acc[item] = 1; return acc; }, {}) }
    }
    form.id === null ? createBackground(formData) : updateBackground(formData);
  }

  const createBackground = async (formData) => {
    const result = await createBackgroundRequest(appState.accessToken, 'dnd', { brewery: formData });

    if (result.errors_list === undefined) {
      batch(() => {
        setBackgrounds([result.background].concat(backgrounds()));
        setOpen(false);
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
        setOpen(false);
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
      <div class="flex my-4">
        <Button default classList="px-2 py-1" onClick={openCreateForm}>{TRANSLATION[locale()].add}</Button>
        <Button default active={!ownFilter()} classList="ml-4 px-2 py-1" onClick={() => setOwnFilter(!ownFilter())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show
        when={!open()}
        fallback={
          <div class="flex flex-col gap-2">
            <p class="text-xl">{TRANSLATION[locale()].newItemTitle}</p>
            <div class="flex gap-1">
              <Button default classList="px-2 py-1" active={formLocale() === 'en'} onClick={() => setFormLocale('en')}>EN</Button>
              <Button default classList="px-2 py-1" active={formLocale() === 'ru'} onClick={() => setFormLocale('ru')}>RU</Button>
              <Button default classList="px-2 py-1" active={formLocale() === 'es'} onClick={() => setFormLocale('es')}>ES</Button>
            </div>
            <Input
              containerClassList="form-field"
              labelText={TRANSLATION[locale()].name}
              value={form.names[formLocale()]}
              onInput={(value) => setForm({ ...form, names: { ...form.names, [formLocale()]: value } })}
            />
            <TextArea
              rows="5"
              labelText={TRANSLATION[locale()].descriptions}
              value={form.descriptions[formLocale()]}
              onChange={(value) => setForm({ ...form, descriptions: { ...form.descriptions, [formLocale()]: value } })}
            />
            <Select
              multi
              labelText={TRANSLATION[locale()].abilities}
              items={translate(config.abilities, locale())}
              selectedValues={form.ability_boosts}
              onSelect={(value) => updateValues(value, 'ability_boosts')}
            />
            <Select
              multi
              labelText={TRANSLATION[locale()].skills}
              items={translate(config.skills, locale())}
              selectedValues={form.selected_skills}
              onSelect={(value) => updateValues(value, 'selected_skills')}
            />
            <Select
              relative
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
              onToggle={() => setForm({ ...form, public: !form.public })}
            />
            <div class="flex gap-1">
              <Button default classList="px-2 py-1" onClick={() => setOpen(false)}>{TRANSLATION[locale()].cancel}</Button>
              <Button default classList="px-2 py-1" onClick={saveBackground}>{TRANSLATION[locale()].save}</Button>
            </div>
          </div>
        }
      >
        <div class="flex items-center mb-2">
          <Select
            containerClassList="w-80"
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
        <Show when={book()}><p class="text-sm mb-2">{TRANSLATION[locale()].selectBookHelp}</p></Show>
        <Show when={filteredBackgrounds().length > 0}>
          <div class="flex flex-col gap-2">
            <For each={filteredBackgrounds()}>
              {(background) =>
                <Toggle
                  title={
                    <div class="flex items-center">
                      <p class="flex-1">{localize(background.data.names, locale())}</p>
                      <div class="col-span-2 flex items-start justify-end gap-2">
                        <Show
                          when={ownFilter()}
                          fallback={
                            <Button default classList="px-2 py-1" onClick={() => copyBackground(background.id)}>
                              <Copy width="20" height="20" />
                            </Button>
                          }
                        >
                          <div class="flex items-center justify-end gap-1 text-neutral-700">
                            <Show when={book()}>
                              <Button default classList="p-2" onClick={(e) => onSelect(e, background.id)}>
                                <span classList={{ 'opacity-25': !selectedIds().includes(background.id) }}>
                                  <Stroke width="16" height="12" />
                                </span>
                              </Button>
                            </Show>
                            <Button default classList="px-2 py-1" onClick={() => openEditForm(background)}>
                              <Edit width="20" height="20" />
                            </Button>
                            <Button default classList="px-2 py-1" onClick={() => removeBackground(background.id)}>
                              <Trash width="20" height="20" />
                            </Button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  }
                >
                  <Show when={localize(background.data.descriptions, locale())}>
                    <p class="mb-2">{localize(background.data.descriptions, locale())}</p>
                  </Show>
                  <p class="text-sm">{TRANSLATION[locale()].selectedAbilities}: {background.data.ability_boosts.map((item) => config.abilities[item].name[locale()]).join(', ')}</p>
                  <p class="text-sm">{TRANSLATION[locale()].selectedSkills}: {Object.keys(background.data.selected_skills).map((item) => config.skills[item].name[locale()]).join(', ')}</p>
                  <p class="text-sm">{TRANSLATION[locale()].feats}: {background.data.selected_feats.map((item) => talents()[item]).join(', ')}</p>
                </Toggle>
              }
            </For>
          </div>
        </Show>
      </Show>
    </Show>
  );
}
