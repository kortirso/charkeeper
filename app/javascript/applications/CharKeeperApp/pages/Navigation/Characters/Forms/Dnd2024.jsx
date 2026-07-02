import { createSignal, createMemo, Show } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox, Label } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale } from '../../../../context';
import { translate, localize } from '../../../../helpers';

const DND2024_DEFAULT_FORM = {
  name: '', species: undefined, legacy: undefined, size: undefined, background: undefined,
  main_class: undefined, alignment: 'neutral', skip_guide: false
};

const TRANSLATION = {
  en: {
    options: 'There are books available in Homebrews/Modules section for additional options for character creation.',
    skipGuide: 'Skip new character guide',
    beyondFile: 'You can import your character from D&D Beyond by using JSON file (you can find extension description at main page)',
    showHomebrew: 'Allow to select homebrews'
  },
  ru: {
    options: 'В разделе Homebrews/Модули доступны книги для расширения возможных вариантов при создании персонажа.',
    skipGuide: 'Пропустить настройку нового персонажа',
    beyondFile: 'Вы можете импортировать своего персонажа из D&D Beyond, используя JSON-файл (описание расширения можно найти на главной странице).',
    showHomebrew: 'Выбирать из homebrew'
  },
  es: {
    options: 'Hay libros disponibles en la sección Homebrews/Módulos para opciones adicionales para la creación de personajes.',
    skipGuide: 'Omitir guía de personaje nuevo',
    beyondFile: 'Puedes importar tu personaje usando de D&D Beyond un archivo JSON (puedes encontrar la descripción de la extensión en la página principal).',
    showHomebrew: 'Allow to select homebrews'
  }
}

export const Dnd2024CharacterForm = (props) => {
  const [showHomebrew, setShowHomebrew] = createSignal(true);

  const [characterDnd2024Form, setCharacterDnd2024Form] = createStore(DND2024_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const jsonString = e.target.result.replace(/,([ \t\r\n]*[}\]])/g, '$1');
        const jsonObject = JSON.parse(jsonString);

        props.onImportCharacter('beyond', jsonObject);
      } catch (error) {
        console.error('Invalid JSON file format:', error.message);
      }
    };

    reader.readAsText(file);
  }

  const saveCharacter = async () => {
    const result = await props.onCreateCharacter(characterDnd2024Form);

    if (result === null) {
      setCharacterDnd2024Form(reconcile({
        name: '', species: undefined, legacy: undefined, size: undefined, background: undefined,
        main_class: undefined, alignment: 'neutral', skip_guide: true
      }));
    }
  }

  const dndBackgrounds = createMemo(() => {
    if (props.homebrews() === undefined) return {};
    if (!showHomebrew()) return config.backgrounds;

    return { ...config.backgrounds, ...props.homebrews().dnd2024.backgrounds };
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
          value={characterDnd2024Form.name}
          onInput={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, name: value })}
        />
        <Select
          labelText={t('newCharacterPage.dnd2024.species')}
          items={translate(props.dnd2024Races(), locale())}
          selectedValue={characterDnd2024Form.species}
          onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, species: value, size: props.dnd2024Races()[value].sizes[0], legacy: undefined })}
        />
        <Show when={characterDnd2024Form.species !== undefined}>
          <Show when={Object.keys(props.dnd2024Races()[characterDnd2024Form.species].legacies).length > 0}>
            <Select
              labelText={t('newCharacterPage.dnd2024.legacy')}
              items={translate(props.dnd2024Races()[characterDnd2024Form.species].legacies, locale())}
              selectedValue={characterDnd2024Form.legacy}
              onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, legacy: value })}
            />
          </Show>
          <Select
            labelText={t('newCharacterPage.dnd2024.size')}
            items={props.dnd2024Races()[characterDnd2024Form.species].sizes.reduce((acc, item) => { acc[item] = t(`newCharacterPage.dnd2024.sizes.${item}`); return acc; }, {})}
            selectedValue={characterDnd2024Form.size}
            onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, size: value })}
          />
        </Show>
        <Select
          labelText={t('newCharacterPage.pathfinder2.background')}
          items={translate(dndBackgrounds(), locale())}
          selectedValue={characterDnd2024Form.background}
          onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, background: value })}
        />
        <Select
          labelText={t('newCharacterPage.dnd2024.mainClass')}
          items={translate(config.classes, locale())}
          selectedValue={characterDnd2024Form.main_class}
          onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, main_class: value })}
        />
        <Select
          labelText={t('newCharacterPage.dnd2024.alignment')}
          items={translate(config.alignments, locale())}
          selectedValue={characterDnd2024Form.alignment}
          onSelect={(value) => setCharacterDnd2024Form({ ...characterDnd2024Form, alignment: value })}
        />
        <Label labelText={localize(TRANSLATION, locale()).beyondFile} />
        <input class="block dark:text-gray-200" type="file" onChange={handleFileChange} />
        <Checkbox
          labelText={localize(TRANSLATION, locale()).skipGuide}
          labelPosition="right"
          labelClassList="ml-2"
          checked={characterDnd2024Form.skip_guide}
          onToggle={() => setCharacterDnd2024Form({ ...characterDnd2024Form, skip_guide: !characterDnd2024Form.skip_guide })}
        />
      </div>
    </CharacterForm>
  );
}
