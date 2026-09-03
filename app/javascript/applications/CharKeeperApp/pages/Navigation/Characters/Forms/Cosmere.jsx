import { createSignal, createMemo, Show } from 'solid-js';
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
    path: 'Select heroic path',
    setting: 'Setting',
    showHomebrew: 'Allow to select homebrews',
    options: 'There are books available in Homebrews/Modules section for additional options for character creation.',
    limits: 'Limit choises by setting'
  },
  ru: {
    name: 'Имя',
    skipGuide: 'Пропустить настройку нового персонажа',
    ancestry: 'Выберите наследие',
    cultures: 'Выберите культуры',
    path: 'Выберите героический путь',
    setting: 'Сеттинг',
    showHomebrew: 'Выбирать из homebrew',
    options: 'В разделе Homebrews/Модули доступны книги для расширения возможных вариантов при создании персонажа.',
    limits: 'Ограничить выбор рамками сеттинга'
  },
  es: {
    name: 'Nombre',
    skipGuide: 'Omitir guía de personaje nuevo',
    ancestry: 'Select ancestry',
    cultures: 'Select cultures',
    path: 'Select heroic path',
    setting: 'Setting',
    showHomebrew: 'Allow to select homebrews',
    options: 'Hay libros disponibles en la sección Homebrews/Módulos para opciones adicionales para la creación de personajes.',
    limits: 'Limit choises by setting'
  }
}
const DEFAULT_FORM = { setting: '', name: '', ancestry: null, cultures: [], path: null, skip_guide: false }

export const CosmereCharacterForm = (props) => {
  const [showHomebrew, setShowHomebrew] = createSignal(true);
  const [limit, setLimit] = createSignal(true);
  const [characterForm, setCharacterForm] = createStore(DEFAULT_FORM);

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

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
      <div class="flex flex-col gap-2">
        <p class="dark:text-snow text-sm">{localize(TRANSLATION, locale()).options}</p>
        <Checkbox
          labelText={localize(TRANSLATION, locale()).showHomebrew}
          labelPosition="right"
          labelClassList="ml-2"
          checked={showHomebrew()}
          onToggle={() => setShowHomebrew(!showHomebrew())}
        />
        <Checkbox
          labelText={localize(TRANSLATION, locale()).limits}
          labelPosition="right"
          labelClassList="ml-2"
          checked={limit()}
          onToggle={() => setLimit(!limit())}
        />
        <Input
          labelText={i18n().name}
          value={characterForm.name}
          onInput={(value) => setCharacterForm({ ...characterForm, name: value })}
        />
        <Select
          labelText={i18n().setting}
          items={translate(config.settings, locale())}
          selectedValue={characterForm.setting}
          onSelect={(value) => setCharacterForm({ ...characterForm, setting: value, ancestry: null, cultures: [] })}
        />
        <Show when={characterForm.setting}>
          <Select
            labelText={i18n().ancestry}
            items={translate(config.ancestries, locale())}
            selectedValue={characterForm.ancestry}
            onSelect={(value) => setCharacterForm({ ...characterForm, ancestry: value })}
          />
          <Select
            multi
            labelText={i18n().cultures}
            items={translate(config.cultures, locale())}
            selectedValues={characterForm.cultures}
            onSelect={updateCulturesValue}
          />
        </Show>
        <Select
          labelText={i18n().path}
          items={translate(config.paths, locale())}
          selectedValue={characterForm.path}
          onSelect={(value) => setCharacterForm({ ...characterForm, path: value })}
        />
        <Checkbox
          labelText={i18n().skipGuide}
          labelPosition="right"
          labelClassList="ml-2"
          checked={characterForm.skip_guide}
          onToggle={() => setCharacterForm({ ...characterForm, skip_guide: !characterForm.skip_guide })}
        />
      </div>
    </CharacterForm>
  );
}
