import { createStore, reconcile } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Input, Checkbox, Select } from '../../../../components';
import config from '../../../../data/cosmere.json';
import { useAppLocale } from '../../../../context';
import { localize, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Name',
    skipGuide: 'Skip new character guide',
    ancestry: 'Select ancestry',
    cultures: 'Select cultures',
    path: 'Select heroic path'
  },
  ru: {
    name: 'Имя',
    skipGuide: 'Пропустить настройку нового персонажа',
    ancestry: 'Выберите наследие',
    cultures: 'Выберите культуры',
    path: 'Выберите героический путь'
  },
  es: {
    name: 'Nombre',
    skipGuide: 'Omitir guía de personaje nuevo',
    ancestry: 'Select ancestry',
    cultures: 'Select cultures',
    path: 'Select heroic path'
  }
}
const DEFAULT_FORM = { name: '', ancestry: null, cultures: [], path: null, skip_guide: false }

export const CosmereCharacterForm = (props) => {
  const [characterForm, setCharacterForm] = createStore(DEFAULT_FORM);

  const [locale] = useAppLocale();

  const updateCulturesValue = async (value) => {
    const newValue = characterForm.cultures.includes(value) ? characterForm.cultures.filter((item) => item !== value) : characterForm.cultures.concat([value]);
    if (newValue.length > 2) return;

    setCharacterForm({ ...characterForm, cultures: newValue });
  }

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterForm);
    if (result === null) {
      setCharacterForm(reconcile(DEFAULT_FORM));
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        labelText={localize(TRANSLATION, locale()).name}
        value={characterForm.name}
        onInput={(value) => setCharacterForm({ ...characterForm, name: value })}
      />
      <Select
        containerClassList="mt-2"
        labelText={localize(TRANSLATION, locale()).ancestry}
        items={translate(config.ancestries, locale())}
        selectedValue={characterForm.ancestry}
        onSelect={(value) => setCharacterForm({ ...characterForm, ancestry: value })}
      />
      <Select
        multi
        containerClassList="mt-2"
        labelText={localize(TRANSLATION, locale()).cultures}
        items={translate(config.cultures, locale())}
        selectedValues={characterForm.cultures}
        onSelect={updateCulturesValue}
      />
      <Select
        containerClassList="mt-2"
        labelText={localize(TRANSLATION, locale()).path}
        items={translate(config.paths, locale())}
        selectedValue={characterForm.path}
        onSelect={(value) => setCharacterForm({ ...characterForm, path: value })}
      />
      <Checkbox
        labelText={localize(TRANSLATION, locale()).skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterForm.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterForm({ ...characterForm, skip_guide: !characterForm.skip_guide })}
      />
    </CharacterForm>
  );
}
