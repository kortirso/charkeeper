import { Show } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Label } from '../../../../components';
import dnd5Config from '../../../../data/dnd5.json';
import dnd2024Config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const DND5_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined, alignment: 'neutral'
}

const TRANSLATION = {
  en: {
    beyondFile: 'You can import your character by using JSON file from D&D Beyond'
  },
  ru: {
    beyondFile: 'You can import your character by using JSON file from D&D Beyond'
  },
  es: {
    beyondFile: 'You can import your character by using JSON file from D&D Beyond'
  }
}

export const Dnd5CharacterForm = (props) => {
  const [form, setForm] = createStore(DND5_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const jsonString = e.target.result.replace(/,([ \t\r\n]*[}\]])/g, '$1');
        const jsonObject = JSON.parse(jsonString);

        props.onImportCharacter('beyond', jsonObject);
      } catch (error) {
        console.error('Invalid JSON file format:', error.message);
      }
    };

    reader.readAsText(file);
  }

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(form);

    if (result === null) {
      setForm(reconcile(
        { name: '', race: undefined, subrace: undefined, main_class: undefined, alignment: 'neutral' }
      ));
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <div class="flex flex-col gap-2">
        <Input
          labelText={t('newCharacterPage.name')}
          value={form.name}
          onInput={(value) => setForm({ ...form, name: value })}
        />
        <Select
          labelText={t('newCharacterPage.dnd5.race')}
          items={translate(dnd5Config.races, locale())}
          selectedValue={form.race}
          onSelect={(value) => setForm({ ...form, race: value, subrace: undefined })}
        />
        <Show when={form.race !== undefined}>
          <Show when={Object.keys(dnd5Config.races[form.race].subraces).length > 0}>
            <Select
              labelText={t('newCharacterPage.dnd5.subrace')}
              items={translate(dnd5Config.races[form.race].subraces, locale())}
              selectedValue={form.subrace}
              onSelect={(value) => setForm({ ...form, subrace: value })}
            />
          </Show>
        </Show>
        <Select
          labelText={t('newCharacterPage.dnd5.mainClass')}
          items={translate(dnd5Config.classes, locale())}
          selectedValue={form.main_class}
          onSelect={(value) => setForm({ ...form, main_class: value })}
        />
        <Select
          labelText={t('newCharacterPage.dnd5.alignment')}
          items={translate(dnd2024Config.alignments, locale())}
          selectedValue={form.alignment}
          onSelect={(value) => setForm({ ...form, alignment: value })}
        />
        <Label labelText={localize(TRANSLATION, locale()).beyondFile} />
        <input class="block dark:text-gray-200" type="file" onChange={handleFileChange} />
      </div>
    </CharacterForm>
  );
}
