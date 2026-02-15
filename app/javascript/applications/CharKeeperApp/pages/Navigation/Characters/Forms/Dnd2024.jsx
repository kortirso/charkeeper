import { createEffect, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import dnd2024Config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { translate, readFromCache, localize } from '../../../../helpers';

const DND2024_DEFAULT_FORM = {
  name: '', species: undefined, legacy: undefined, size: undefined, background: undefined,
  main_class: undefined, alignment: 'neutral', skip_guide: false
};
const RENDER_GUIDE_CACHE_NAME = 'RenderGuideSettings';

const TRANSLATION = {
  en: {
    skipGuide: 'Skip new character guide'
  },
  ru: {
    skipGuide: 'Пропустить настройку нового персонажа'
  }
}

export const Dnd2024CharacterForm = (props) => {
  const [characterDnd2024Form, setCharacterDnd2024Form] = createStore(DND2024_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const readGuideSettings = async () => {
    const cacheValue = await readFromCache(RENDER_GUIDE_CACHE_NAME);
    const value = cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue);

    setCharacterDnd2024Form({ ...characterDnd2024Form, skip_guide: value.dnd2024 === false })
  }

  createEffect(() => {
    readGuideSettings();
  });

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterDnd2024Form);

    if (result === null) {
      setCharacterDnd2024Form({
        name: '', species: undefined, legacy: undefined, size: undefined, background: undefined,
        main_class: undefined, alignment: 'neutral', skip_guide: true
      });
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={t('newCharacterPage.name')}
        value={characterDnd2024Form.name}
        onInput={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.dnd2024.species')}
        items={translate(props.dnd2024Races(), locale())}
        selectedValue={characterDnd2024Form.species}
        onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, species: value, size: props.dnd2024Races()[value].sizes[0], legacy: undefined })}
      />
      <Show when={characterDnd2024Form.species !== undefined}>
        <Show when={Object.keys(props.dnd2024Races()[characterDnd2024Form.species].legacies).length > 0}>
          <Select
            containerClassList="mb-2"
            labelText={t('newCharacterPage.dnd2024.legacy')}
            items={translate(props.dnd2024Races()[characterDnd2024Form.species].legacies, locale())}
            selectedValue={characterDnd2024Form.legacy}
            onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, legacy: value })}
          />
        </Show>
        <Select
          containerClassList="mb-2"
          labelText={t('newCharacterPage.dnd2024.size')}
          items={props.dnd2024Races()[characterDnd2024Form.species].sizes.reduce((acc, item) => { acc[item] = t(`newCharacterPage.dnd2024.sizes.${item}`); return acc; }, {})}
          selectedValue={characterDnd2024Form.size}
          onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, size: value })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.pathfinder2.background')}
        items={translate(dnd2024Config.backgrounds, locale())}
        selectedValue={characterDnd2024Form.background}
        onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, background: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.dnd2024.mainClass')}
        items={translate(dnd2024Config.classes, locale())}
        selectedValue={characterDnd2024Form.main_class}
        onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, main_class: value })}
      />
      <Select
        labelText={t('newCharacterPage.dnd2024.alignment')}
        items={translate(dnd2024Config.alignments, locale())}
        selectedValue={characterDnd2024Form.alignment}
        onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, alignment: value })}
      />
      <Checkbox
        labelText={localize(TRANSLATION, locale()).skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterDnd2024Form.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterDnd2024Form({ ...characterDnd2024Form, skip_guide: !characterDnd2024Form.skip_guide })}
      />
    </CharacterForm>
  );
}
