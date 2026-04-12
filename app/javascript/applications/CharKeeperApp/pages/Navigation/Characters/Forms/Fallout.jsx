import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Name',
    origin: 'Origin',
    skipGuide: 'Skip new character guide'
  },
  ru: {
    name: 'Имя',
    origin: 'Происхождение',
    skipGuide: 'Пропустить настройку нового персонажа'
  },
  es: {
    name: 'Nombre',
    origin: 'Origen',
    skipGuide: 'Omitir guía de personaje nuevo'
  }
}

const FALLOUT_DEFAULT_FORM = { name: '', origin: '', skip_guide: false };

export const FalloutCharacterForm = (props) => {
  const [characterFalloutForm, setCharacterFalloutForm] = createStore(FALLOUT_DEFAULT_FORM);

  const [locale] = useAppLocale();

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterFalloutForm);
    if (result === null) {
      setCharacterFalloutForm({ name: '', origin: '', skip_guide: true });
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={localize(TRANSLATION, locale()).name}
        value={characterFalloutForm.name}
        onInput={(value) => setCharacterFalloutForm({ ...characterFalloutForm, name: value })}
      />
      <Select
        containerClassList="mb-4"
        labelText={localize(TRANSLATION, locale()).origin}
        items={translate(config.origins, locale())}
        selectedValue={characterFalloutForm.origin}
        onSelect={(value) => setCharacterFalloutForm({ ...characterFalloutForm, origin: value })}
      />
      <Checkbox
        labelText={localize(TRANSLATION, locale()).skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterFalloutForm.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterFalloutForm({ ...characterFalloutForm, skip_guide: !characterFalloutForm.skip_guide })}
      />
    </CharacterForm>
  );
}
