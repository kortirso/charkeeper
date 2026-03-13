import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Input } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const FATE_DEFAULT_FORM = { name: '' };
const TRANSLATION = {
  en: {
    name: 'Name'
  },
  ru: {
    name: 'Имя'
  },
  es: {
    name: 'Nombre'
  }
}

export const FateCharacterForm = (props) => {
  const [characterForm, setCharacterForm] = createStore(FATE_DEFAULT_FORM);

  const [locale] = useAppLocale();

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterForm);

    if (result === null) setCharacterForm({ name: '' });
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={localize(TRANSLATION, locale()).name}
        value={characterForm.name}
        onInput={(value) => setCharacterForm({ ...characterForm, name: value })}
      />
    </CharacterForm>
  );
}
