import { Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input } from '../../../../components';
import dnd5Config from '../../../../data/dnd5.json';
import dnd2024Config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { translate } from '../../../../helpers';

const DND5_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined,
  alignment: 'neutral'
}

export const Dnd5CharacterForm = (props) => {
  const [characterDnd5Form, setCharacterDnd5Form] = createStore(DND5_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterDnd5Form);

    if (result === null) {
      setCharacterDnd5Form({
        name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
        background: undefined, main_ability: undefined
      });
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={t('newCharacterPage.name')}
        value={characterDnd5Form.name}
        onInput={(value) => setCharacterDnd5Form({ ...characterDnd5Form, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.dnd5.race')}
        items={translate(dnd5Config.races, locale())}
        selectedValue={characterDnd5Form.race}
        onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, race: value, subrace: undefined })}
      />
      <Show when={characterDnd5Form.race !== undefined}>
        <Show when={Object.keys(dnd5Config.races[characterDnd5Form.race].subraces).length > 0}>
          <Select
            containerClassList="mb-2"
            labelText={t('newCharacterPage.dnd5.subrace')}
            items={translate(dnd5Config.races[characterDnd5Form.race].subraces, locale())}
            selectedValue={characterDnd5Form.subrace}
            onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, subrace: value })}
          />
        </Show>
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.dnd5.mainClass')}
        items={translate(dnd5Config.classes, locale())}
        selectedValue={characterDnd5Form.main_class}
        onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, main_class: value })}
      />
      <Select
        labelText={t('newCharacterPage.dnd5.alignment')}
        items={translate(dnd2024Config.alignments, locale())}
        selectedValue={characterDnd5Form.alignment}
        onSelect={(value) => setCharacterDnd5Form({ ...characterDnd5Form, alignment: value })}
      />
    </CharacterForm>
  );
}
