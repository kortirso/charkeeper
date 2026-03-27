import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Input, Checkbox } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Name',
    skipGuide: 'Skip new character guide'
  },
  ru: {
    name: 'Имя',
    skipGuide: 'Пропустить настройку нового персонажа'
  }
}

export const CosmereCharacterForm = (props) => {
  const [characterForm, setCharacterForm] = createStore({ name: '', skip_guide: false });

  const [locale] = useAppLocale();

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterForm);
    if (result === null) {
      setCharacterForm({ name: '', skip_guide: true });
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
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
      />
    </CharacterForm>
  );
}
