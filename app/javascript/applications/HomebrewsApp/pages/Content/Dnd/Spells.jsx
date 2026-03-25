import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { Button, Input, TextArea, Select, createModal, Checkbox } from '../../../components';
import { Edit, Trash, Copy } from '../../../assets';
import { fetchBooksRequest } from '../../../requests/books/fetchBooksRequest';
import { changeBookContent } from '../../../requests/changeBookContent';
import { fetchHomebrewSpellsRequest } from '../../../requests/fetchHomebrewSpellsRequest';
import { createSpellRequest } from '../../../requests/createSpellRequest';
import { changeSpellRequest } from '../../../requests/changeSpellRequest';
import { removeSpellRequest } from '../../../requests/removeSpellRequest';
import { copySpellRequest } from '../../../requests/copySpellRequest';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    added: 'Content is added to the book',
    selectBook: 'Select book',
    selectBookHelp: 'Select required elements for adding to the book',
    add: 'Add spell',
    newItemTitle: 'Spell form',
    name: 'Spell name',
    description: 'Description',
    save: 'Save',
    classes: 'Available classes',
    schools: {
      abjuration: 'Abjuration',
      conjuration: 'Conjuration',
      divination: 'Divination',
      enchantment: 'Enchantment',
      evocation: 'Evocation',
      illusion: 'Illusion',
      necromancy: 'Necromancy',
      transmutation: 'Transmutation'
    },
    school: 'School of magic',
    level: 'Spell level',
    time: 'Time',
    range: 'Range',
    duration: 'Duration',
    component: 'Components',
    components: {
      v: 'Verbal',
      s: 'Somatic',
      m: 'Material'
    },
    dc: 'Saving throw',
    showPublic: 'Show public',
    public: 'Public',
    copyCompleted: 'Spell copy is completed'
  },
  ru: {
    added: 'Контент добавлен в книгу',
    selectBook: 'Выберите книгу',
    selectBookHelp: 'Выберите необходимые элементы для добавления в книгу',
    add: 'Добавить заклинание',
    newItemTitle: 'Редактирование заклинания',
    name: 'Название заклинания',
    description: 'Описание',
    save: 'Сохранить',
    classes: 'Доступность для классов',
    schools: {
      abjuration: 'Ограждение',
      conjuration: 'Вызов',
      divination: 'Прорицание',
      enchantment: 'Очарование',
      evocation: 'Воплощение',
      illusion: 'Иллюзия',
      necromancy: 'Некромантия',
      transmutation: 'Преобразование'
    },
    school: 'Школа магии',
    level: 'Уровень заклинания',
    time: 'Время',
    range: 'Дальность',
    duration: 'Длительность',
    component: 'Компоненты',
    components: {
      v: 'Вербальный',
      s: 'Соматический',
      m: 'Материальный'
    },
    dc: 'Спасбросок',
    showPublic: 'Показать общедоступные',
    public: 'Общедоступный',
    copyCompleted: 'Копирование заклинания завершено'
  }
}

export const DndSpells = () => {
  const [form, setForm] = createStore({
    title: '', description: '', origin_values: [], public: false, level: 0, school: null, time: '', range: '',
    components: [], duration: '', effects: [], hit: false, dc: null
  });
  const [selectedIds, setSelectedIds] = createSignal([]);
  const [book, setBook] = createSignal(null);

  const [books, setBooks] = createSignal(undefined);
  const [spells, setSpells] = createSignal(undefined);
  const [open, setOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  createEffect(() => {
    const fetchBooks = async () => await fetchBooksRequest(appState.accessToken, 'dnd');
    const fetchSpells = async () => await fetchHomebrewSpellsRequest(appState.accessToken, 'dnd');

    Promise.all([fetchSpells(), fetchBooks()]).then(
      ([spellsDate, booksData]) => {
        batch(() => {
          setBooks(booksData.books.filter((item) => item.shared === null));
          setSpells(spellsDate.spells);
        });
      }
    );
  });

  const filteredSpells = createMemo(() => {
    if (spells() === undefined) return [];

    return spells().filter(({ own }) => open() ? !own : own);
  });

  const openCreateModal = () => {
    batch(() => {
      setForm({
        id: null, title: '', description: '', origin_values: [], public: false, level: 0, school: null, time: '', range: '',
        components: [], duration: '', effects: [], hit: false, dc: null
      });
      openModal();
    });
  }

  const openChangeModal = (spell) => {
    batch(() => {
      setForm({
        id: spell.id, title: spell.title.en, description: spell.description.en, origin_values: spell.origin_values,
        public: spell.public, level: spell.info.level.toString(), school: spell.info.school, time: spell.info.time,
        range: spell.info.range, components: spell.info.components.split(','), duration: spell.info.duration,
        effects: spell.info.effects, hit: spell.info.hit, dc: spell.info.dc
      });
      openModal();
    });
  }

  const updateOriginValues = (value) => {
    const currentValues = form.origin_values;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setForm({ ...form, origin_values: newValue });
  }

  const updateComponents = (value) => {
    const currentValues = form.components;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setForm({ ...form, components: newValue });
  }

  const saveSpell = () => {
    const { title: title, description: description, origin_values: origin_values, ...info } = form; // eslint-disable-line solid/reactivity

    const formData = {
      title: title,
      description: description,
      origin_values: origin_values,
      public: form.public,
      info: { ...info, components: info.components.join(',') }
    }

    form.id === null ? createSpell(formData) : updateSpell(formData);
  }

  const createSpell = async (formData) => {
    const result = await createSpellRequest(appState.accessToken, 'dnd', { brewery: formData });

    if (result.errors_list === undefined) {
      batch(() => {
        setSpells([result.spell].concat(spells()));
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const updateSpell = async (formData) => {
    const result = await changeSpellRequest(appState.accessToken, 'dnd', form.id, { brewery: formData });

    if (result.errors_list === undefined) {
      const newSpells = spells().map((spell) => {
        if (form.id !== spell.id) return spell;

        return result.spell;
      });

      batch(() => {
        setSpells(newSpells);
        closeModal();
      });
    } else renderAlerts(result.errors_list);
  }

  const removeSpell = async (spellId) => {
    const result = await removeSpellRequest(appState.accessToken, 'dnd', spellId);

    if (result.errors_list === undefined) {
      setSpells(spells().filter(({ id }) => id !== spellId ));
    } else renderAlerts(result.errors_list);
  }

  const copySpell = async (spellId) => {
    const result = await copySpellRequest(appState.accessToken, 'dnd', spellId);

    if (result.errors_list === undefined) {
      setSpells([result.spell].concat(spells()));
      renderNotice(TRANSLATION[locale()].copyCompleted);
    } else renderAlerts(result.errors_list);
  }

  const addToBook = async () => {
    const result = await changeBookContent(appState.accessToken, book(), { ids: selectedIds(), only_head: true }, 'spell');

    if (result.errors_list === undefined) {
      batch(() => {
        setBook(null);
        setSelectedIds([]);
      });
      renderNotice(TRANSLATION[locale()].added)
    }
  }

  return (
    <Show when={spells() !== undefined} fallback={<></>}>
      <div class="flex">
        <Button default classList="mb-4 px-2 py-1" onClick={openCreateModal}>{TRANSLATION[locale()].add}</Button>
        <Button default active={open()} classList="ml-4 mb-4 px-2 py-1" onClick={() => setOpen(!open())}>{TRANSLATION[locale()].showPublic}</Button>
      </div>
      <Show when={filteredSpells().length > 0}>
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
            <For each={filteredSpells()}>
              {(spell) =>
                <tr>
                  <td class="minimum-width py-1">
                    <Checkbox
                      checked={selectedIds().includes(spell.id)}
                      classList="mr-1"
                      innerClassList="small"
                      onToggle={() => selectedIds().includes(spell.id) ? setSelectedIds(selectedIds().filter((id) => id !== spell.id)) : setSelectedIds(selectedIds().concat(spell.id))}
                    />
                  </td>
                  <td class="minimum-width py-1">{spell.title[locale()]}</td>
                  <td class="py-1">{spell.description[locale()]}</td>
                  <td>
                    <div class="col-span-2 flex items-start justify-end gap-2">
                      <Show
                        when={!open()}
                        fallback={
                          <Button default classList="px-2 py-1" onClick={() => copySpell(spell.id)}>
                            <Copy width="20" height="20" />
                          </Button>
                        }
                      >
                        <Show when={filteredSpells().length > 0}>
                          <div class="flex items-center justify-end gap-x-2 text-neutral-700">
                            <Button default classList="px-2 py-1" onClick={() => openChangeModal(spell)}>
                              <Edit width="20" height="20" />
                            </Button>
                            <Button default classList="px-2 py-1" onClick={() => removeSpell(spell.id)}>
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
          value={form.title}
          onInput={(value) => setForm({ ...form, title: value })}
        />
        <Select
          multi
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].classes}
          items={translate(config.classes, locale())}
          selectedValues={form.origin_values}
          onSelect={updateOriginValues}
        />
        <div class="flex items-center gap-x-2 mt-2">
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].school}
            items={TRANSLATION[locale()].schools}
            selectedValues={form.school}
            onSelect={(value) => setForm({ ...form, school: value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].level}
            items={{ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9 }}
            selectedValues={form.level}
            onSelect={(value) => setForm({ ...form, level: value })}
          />
        </div>
        <div class="flex items-center gap-x-2 mt-2">
          <Input
            containerClassList="flex-1"
            placeholder="A/BA/R / 1,m / 1,h"
            labelText={TRANSLATION[locale()].time}
            value={form.time}
            onInput={(value) => setForm({ ...form, time: value })}
          />
          <Input
            containerClassList="flex-1"
            placeholder="instant / 1,r / 1,m / 1,h / 1,d"
            labelText={TRANSLATION[locale()].duration}
            value={form.duration}
            onInput={(value) => setForm({ ...form, duration: value })}
          />
          <Input
            containerClassList="flex-1"
            placeholder="none / self/ touch / 1,ft / 1,mile"
            labelText={TRANSLATION[locale()].range}
            value={form.range}
            onInput={(value) => setForm({ ...form, range: value })}
          />
        </div>
        <div class="flex items-center gap-x-2 mt-2">
          <Select
            multi
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].component}
            items={TRANSLATION[locale()].components}
            selectedValues={form.components}
            onSelect={updateComponents}
          />
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].dc}
            items={translate(config.abilities, locale())}
            selectedValues={form.dc}
            onSelect={(value) => setForm({ ...form, dc: value })}
          />
        </div>
        <TextArea
          rows="5"
          containerClassList="mt-2"
          labelText={TRANSLATION[locale()].description}
          value={form.description}
          onChange={(value) => setForm({ ...form, description: value })}
        />
        <Checkbox
          labelText={TRANSLATION[locale()].public}
          labelPosition="right"
          labelClassList="ml-2"
          checked={form.public}
          classList="mt-4"
          onToggle={() => setForm({ ...form, public: !form.public })}
        />
        <Button default classList="mt-4 px-2 py-1" onClick={saveSpell}>{TRANSLATION[locale()].save}</Button>
      </Modal>
    </Show>
  );
}
