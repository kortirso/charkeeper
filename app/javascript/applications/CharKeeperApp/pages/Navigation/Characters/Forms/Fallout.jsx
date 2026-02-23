import { createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import config from '../../../../data/fallout.json';
import { useAppLocale, useAppAlert } from '../../../../context';
import { translate, readFromCache, localize, performResponse } from '../../../../helpers';

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
  }
}

const FALLOUT_DEFAULT_FORM = { name: '', origin: '', skip_guide: false };
const RENDER_GUIDE_CACHE_NAME = 'RenderGuideSettings';

export const FalloutCharacterForm = (props) => {
  const [characterFalloutForm, setCharacterFalloutForm] = createStore(FALLOUT_DEFAULT_FORM);

  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const readGuideSettings = async () => {
    const cacheValue = await readFromCache(RENDER_GUIDE_CACHE_NAME);
    const value = cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue);

    setCharacterFalloutForm({ ...characterFalloutForm, skip_guide: value.fallout === false })
  }

  createEffect(() => {
    readGuideSettings();
  });

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterFalloutForm);
    performResponse(
      result,
      function() {
        setCharacterFalloutForm({ name: '', origin: '', skip_guide: true });
      },
      function() { renderAlerts(result.errors_list) }
    );
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
