import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Input, Checkbox } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const CTHULHU7_DEFAULT_FORM = { name: '', skip_guide: false };
const TRANSLATION = {
  en: {
    name: 'Name',
    skipGuide: 'Skip new character guide'
  },
  ru: {
    name: 'Имя',
    skipGuide: 'Пропустить настройку нового персонажа'
  },
  es: {
    name: 'Nombre',
    skipGuide: 'Omitir guía de personaje nuevo'
  }
}

export const Cthulhu7CharacterForm = (props) => {
  const [characterForm, setCharacterForm] = createStore(CTHULHU7_DEFAULT_FORM);

  const [locale] = useAppLocale();

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterForm);

    if (result === null) setCharacterForm({ name: '', skip_guide: false });
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={localize(TRANSLATION, locale()).name}
        value={characterForm.name}
        onInput={(value) => setCharacterForm({ ...characterForm, name: value })}
      />
      <Checkbox
        labelText={localize(TRANSLATION, locale()).skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterForm.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterForm({ ...characterForm, skip_guide: !characterForm.skip_guide })}
        dataTestId="character-skip-guide-checkbox"
      />
    </CharacterForm>
  );
}
