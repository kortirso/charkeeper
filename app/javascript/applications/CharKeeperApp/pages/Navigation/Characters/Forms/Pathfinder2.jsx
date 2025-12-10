import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input } from '../../../../components';
import dnd2024Config from '../../../../data/dnd2024.json';
import pathfinder2Config from '../../../../data/pathfinder2.json';
import { useAppLocale } from '../../../../context';
import { translate } from '../../../../helpers';

const PATHFINDER2_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
  background: undefined, main_ability: undefined
}

export const Pathfinder2CharacterForm = (props) => {
  const [characterPathfinder2Form, setCharacterPathfinder2Form] = createStore(PATHFINDER2_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const mainAbilityOptions = createMemo(() => {
    if (characterPathfinder2Form.main_class === undefined) return {};

    const classOptions = pathfinder2Config.classes[characterPathfinder2Form.main_class].main_ability_options;

    let subclassOptions = [];
    if (characterPathfinder2Form.subclass !== undefined) {
      subclassOptions = pathfinder2Config.classes[characterPathfinder2Form.main_class].subclasses[characterPathfinder2Form.subclass].main_ability_options || [];
    }
    const allOptions = subclassOptions.concat(classOptions);

    return Object.fromEntries(Object.entries(dnd2024Config.abilities).map(([key, values]) => [key, values.name[locale()]]).filter(([key,]) => allOptions.includes(key)));
  });

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterPathfinder2Form);

    if (result === null) {
      setCharacterPathfinder2Form({
        name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
        background: undefined, main_ability: undefined
      });
    }
  }

  return (
    <CharacterForm loading={props.loading} setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={t('newCharacterPage.name')}
        value={characterPathfinder2Form.name}
        onInput={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.pathfinder2.race')}
        items={translate(pathfinder2Config.races, locale())}
        selectedValue={characterPathfinder2Form.race}
        onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, race: value, subrace: undefined })}
      />
      <Show when={pathfinder2Config.races[characterPathfinder2Form.race]?.subraces}>
        <Select
          containerClassList="mb-2"
          labelText={t('newCharacterPage.pathfinder2.subrace')}
          items={translate(pathfinder2Config.races[characterPathfinder2Form.race].subraces, locale())}
          selectedValue={characterPathfinder2Form.subrace}
          onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, subrace: value })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.pathfinder2.background')}
        items={translate(pathfinder2Config.backgrounds, locale())}
        selectedValue={characterPathfinder2Form.background}
        onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, background: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.pathfinder2.mainClass')}
        items={translate(pathfinder2Config.classes, locale())}
        selectedValue={characterPathfinder2Form.main_class}
        onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, main_class: value, main_ability: pathfinder2Config.classes[value].main_ability_options[0], subclass: undefined })}
      />
      <Show when={pathfinder2Config.classes[characterPathfinder2Form.main_class]?.subclasses}>
        <Select
          containerClassList="mb-2"
          labelText={pathfinder2Config.classes[characterPathfinder2Form.main_class].subclass_title[locale()]}
          items={translate(pathfinder2Config.classes[characterPathfinder2Form.main_class].subclasses, locale())}
          selectedValue={characterPathfinder2Form.subclass}
          onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, subclass: value, main_ability: pathfinder2Config.classes[characterPathfinder2Form.main_class].main_ability_options[0] })}
        />
      </Show>
      <Show when={Object.keys(mainAbilityOptions()).length > 1}>
        <Select
          containerClassList="mt-2"
          labelText={t('newCharacterPage.pathfinder2.mainAbility')}
          items={mainAbilityOptions()}
          selectedValue={characterPathfinder2Form.main_ability}
          onSelect={(value) => setCharacterPathfinder2Form({ ...characterPathfinder2Form, main_ability: value })}
        />
      </Show>
    </CharacterForm>
  );
}
