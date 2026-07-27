import { createStore, reconcile } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import config from '../../../../data/nimble.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const DEFAULT_FORM = { name: '', ancestry: undefined, main_class: undefined, skip_guide: false };
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

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(form);

    if (result === null) setForm(reconcile(DEFAULT_FORM));
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <div class="flex flex-col gap-2">
        <Input
          labelText={localize(TRANSLATION, locale()).name}
          value={form.name}
          onInput={(value) => setForm({ ...form, name: value })}
        />
        <Select
          searchable
          labelText={localize(TRANSLATION, locale()).race}
          items={translate(config.ancestries, locale(), true)}
          selectedValue={form.ancestry}
          onSelect={(value) => setForm({ ...form, ancestry: value })}
        />
        <Select
          searchable
          labelText={localize(TRANSLATION, locale()).mainClass}
          items={translate(config.classes, locale(), true)}
          selectedValue={form.main_class}
          onSelect={(value) => setForm({ ...form, main_class: value })}
        />
        <Checkbox
          labelText={localize(TRANSLATION, locale()).skipGuide}
          labelPosition="right"
          labelClassList="ml-2"
          checked={form.skip_guide}
          onToggle={() => setForm({ ...form, skip_guide: !form.skip_guide })}
        />
      </div>
    </CharacterForm>
  );
}
