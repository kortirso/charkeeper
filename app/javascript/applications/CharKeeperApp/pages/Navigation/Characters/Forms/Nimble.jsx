import { createSignal, createMemo, Show } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const DEFAULT_FORM = { name: '', size: 'medium', ancestry: undefined, main_class: undefined, skip_guide: false };
const TRANSLATION = {
  en: {
    name: 'Name',
    race: 'Ancestry',
    mainClass: 'Class',
    skipGuide: 'Skip new character guide',
    options: 'There are books available in Homebrews/Modules section for additional options for character creation.',
    showHomebrew: 'Allow to select homebrews',
    size: 'Size'
  },
  ru: {
    name: 'Имя',
    race: 'Раса',
    mainClass: 'Класс',
    skipGuide: 'Пропустить настройку нового персонажа',
    options: 'В разделе Homebrews/Модули доступны книги для расширения возможных вариантов при создании персонажа.',
    showHomebrew: 'Выбирать из homebrew',
    size: 'Размер'
  },
  es: {
    name: 'Nombre',
    race: 'Raza',
    mainClass: 'Clase',
    skipGuide: 'Omitir guía de personaje nuevo',
    options: 'Hay libros disponibles en la sección Homebrews/Módulos para opciones adicionales para la creación de personajes.',
    showHomebrew: 'Allow to select homebrews',
    size: 'Size'
  }
}

export const NimbleForm = (props) => {
  console.log(props.homebrews())
  const [form, setForm] = createStore(DEFAULT_FORM);
  const [showHomebrew, setShowHomebrew] = createSignal(true);

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const ancestries = createMemo(() => {
    if (props.homebrews() === undefined) return {};
    if (!showHomebrew()) return config.ancestries;

    return { ...config.ancestries, ...props.homebrews().nimble.races };
  });

  const saveCharacter = async () => {
    if (form.name.length === 0) return;
    if (!form.ancestry) return;
    if (!form.main_class) return;

    const result = await props.onCreateCharacter(form);

    if (result === null) setForm(reconcile(DEFAULT_FORM));
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <div class="flex flex-col gap-2">
        <p class="dark:text-snow text-sm">{i18n().options}</p>
        <Checkbox
          labelText={i18n().showHomebrew}
          labelPosition="right"
          labelClassList="ml-2"
          checked={showHomebrew()}
          onToggle={() => setShowHomebrew(!showHomebrew())}
        />
        <Input labelText={i18n().name} value={form.name} onInput={(value) => setForm({ ...form, name: value })} />
        <Select
          searchable
          labelText={i18n().race}
          items={translate(ancestries(), locale(), true)}
          selectedValue={form.ancestry}
          onSelect={(value) => setForm({ ...form, ancestry: value, size: ancestries()[value].size[0] })}
        />
        <Show when={form.ancestry && ancestries()[form.ancestry].size.length > 1}>
          <Select
            labelText={i18n().size}
            items={ancestries()[form.ancestry].size.reduce((acc, item) => { acc[item] = localize(config.sizes[item].name, locale()); return acc; }, {})}
            selectedValue={form.size}
            onSelect={(value) => setForm({ ...form, size: value })}
          />
        </Show>
        <Select
          searchable
          labelText={i18n().mainClass}
          items={translate(config.classes, locale(), true)}
          selectedValue={form.main_class}
          onSelect={(value) => setForm({ ...form, main_class: value })}
        />
        <Checkbox
          labelText={i18n().skipGuide}
          labelPosition="right"
          labelClassList="ml-2"
          checked={form.skip_guide}
          onToggle={() => setForm({ ...form, skip_guide: !form.skip_guide })}
        />
      </div>
    </CharacterForm>
  );
}
