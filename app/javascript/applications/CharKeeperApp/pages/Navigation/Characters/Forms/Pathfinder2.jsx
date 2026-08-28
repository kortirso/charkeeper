import { createSignal, createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import dnd2024Config from '../../../../data/dnd2024.json';
import pathfinder2Config from '../../../../data/pathfinder2.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const PATHFINDER2_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
  background: undefined, main_ability: undefined
}

const TRANSLATION = {
  en: {
    options: 'There are books available in Homebrews/Modules section for additional options for character creation.',
    showHomebrew: 'Allow to select homebrews'
  },
  ru: {
    options: 'В разделе Homebrews/Модули доступны книги для расширения возможных вариантов при создании персонажа.',
    showHomebrew: 'Выбирать из homebrew'
  },
  es: {
    options: 'Hay libros disponibles en la sección Homebrews/Módulos para opciones adicionales para la creación de personajes.',
    showHomebrew: 'Allow to select homebrews'
  }
}

export const Pathfinder2CharacterForm = (props) => {
  const [showHomebrew, setShowHomebrew] = createSignal(true);
  const [form, setForm] = createStore(PATHFINDER2_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const mainAbilityOptions = createMemo(() => {
    if (form.main_class === undefined) return {};

    const classOptions = pathfinder2Config.classes[form.main_class].main_ability_options;

    let subclassOptions = [];
    if (form.subclass !== undefined) {
      subclassOptions = pathfinder2Config.classes[form.main_class].subclasses[form.subclass].main_ability_options || [];
    }
    const allOptions = subclassOptions.concat(classOptions);

    return Object.fromEntries(Object.entries(dnd2024Config.abilities).map(([key, values]) => [key, localize(values.name, locale())]).filter(([key,]) => allOptions.includes(key)));
  });

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(form);

    if (result === null) {
      setForm({
        name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
        background: undefined, main_ability: undefined
      });
    }
  }

  const pf2Backgrounds = createMemo(() => {
    if (props.homebrews() === undefined) return {};
    if (!showHomebrew()) return pathfinder2Config.backgrounds;

    return { ...pathfinder2Config.backgrounds, ...props.homebrews().pathfinder2.backgrounds };
  });

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <div class="flex flex-col gap-2">
        <p class="dark:text-snow text-sm">{localize(TRANSLATION, locale()).options}</p>
        <Checkbox
          labelText={localize(TRANSLATION, locale()).showHomebrew}
          labelPosition="right"
          labelClassList="ml-2"
          checked={showHomebrew()}
          onToggle={() => setShowHomebrew(!showHomebrew())}
        />
        <Input
          labelText={t('newCharacterPage.name')}
          value={form.name}
          onInput={(value) => setForm({ ...form, name: value })}
        />
        <Select
          searchable
          labelText={t('newCharacterPage.pathfinder2.race')}
          items={translate(pathfinder2Config.races, locale(), true)}
          selectedValue={form.race}
          onSelect={(value) => setForm({ ...form, race: value, subrace: undefined })}
        />
        <Show when={pathfinder2Config.races[form.race]?.subraces}>
          <Select
            labelText={t('newCharacterPage.pathfinder2.subrace')}
            items={translate(pathfinder2Config.races[form.race].subraces, locale())}
            selectedValue={form.subrace}
            onSelect={(value) => setForm({ ...form, subrace: value })}
          />
        </Show>
        <Select
          searchable
          labelText={t('newCharacterPage.pathfinder2.background')}
          items={translate(pf2Backgrounds(), locale(), true)}
          selectedValue={form.background}
          onSelect={(value) => setForm({ ...form, background: value })}
        />
        <Select
          searchable
          labelText={t('newCharacterPage.pathfinder2.mainClass')}
          items={translate(pathfinder2Config.classes, locale(), true)}
          selectedValue={form.main_class}
          onSelect={(value) => setForm({ ...form, main_class: value, main_ability: pathfinder2Config.classes[value].main_ability_options[0], subclass: undefined })}
        />
        <Show when={pathfinder2Config.classes[form.main_class]?.subclasses}>
          <Select
            labelText={localize(pathfinder2Config.classes[form.main_class].subclass_title, locale())}
            items={translate(pathfinder2Config.classes[form.main_class].subclasses, locale())}
            selectedValue={form.subclass}
            onSelect={(value) => setForm({ ...form, subclass: value, main_ability: pathfinder2Config.classes[form.main_class].main_ability_options[0] })}
          />
        </Show>
        <Show when={Object.keys(mainAbilityOptions()).length > 1}>
          <Select
            labelText={t('newCharacterPage.pathfinder2.mainAbility')}
            items={mainAbilityOptions()}
            selectedValue={form.main_ability}
            onSelect={(value) => setForm({ ...form, main_ability: value })}
          />
        </Show>
      </div>
    </CharacterForm>
  );
}
