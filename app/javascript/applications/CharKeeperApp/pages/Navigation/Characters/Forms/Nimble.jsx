import { createMemo } from 'solid-js';
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
    skipGuide: 'Skip new character guide'
  },
  ru: {
    name: 'Имя',
    race: 'Раса',
    mainClass: 'Класс',
    skipGuide: 'Пропустить настройку нового персонажа'
  },
  es: {
    name: 'Nombre',
    race: 'Raza',
    mainClass: 'Clase',
    skipGuide: 'Omitir guía de personaje nuevo'
  }
}

export const NimbleForm = (props) => {
  const [form, setForm] = createStore(DEFAULT_FORM);

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const saveCharacter = async () => {
    if (form.name.length === 0) return;
    if (!form.ancestry) return;
    if (!form.main_class) return;

    const result = await props.onCreateCharacter({ ...form, size: config.ancestries[form.ancestry].size });

    if (result === null) setForm(reconcile(DEFAULT_FORM));
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <div class="flex flex-col gap-2">
        <Input
          labelText={i18n().name}
          value={form.name}
          onInput={(value) => setForm({ ...form, name: value })}
        />
        <Select
          searchable
          labelText={i18n().race}
          items={translate(config.ancestries, locale(), true)}
          selectedValue={form.ancestry}
          onSelect={(value) => setForm({ ...form, ancestry: value })}
        />
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
