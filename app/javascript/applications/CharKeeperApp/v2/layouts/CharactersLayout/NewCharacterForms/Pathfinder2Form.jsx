import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Checkbox, Input, Select } from '../../../components';
import config from '../../../data/pathfinder2.json';
import { useAppLocale } from '../../../context';
import { localize, translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    ancestry: 'Ancestry',
    background: 'Background',
    buildId: 'Build ID',
    characterClass: 'Class',
    heritage: 'Heritage',
    import: 'Import from Pathbuilder by ID',
    mainAbility: 'Key ability',
    name: 'Character name',
    namePlaceholder: 'Vaelis, for example',
    nothingFound: 'Nothing found',
    searchPlaceholder: 'Search…',
    showHomebrew: 'Allow Homebrew options'
  },
  ru: {
    ancestry: 'Наследие',
    background: 'Происхождение',
    buildId: 'Build ID',
    characterClass: 'Класс',
    heritage: 'Разновидность наследия',
    import: 'Импорт из Pathbuilder по ID',
    mainAbility: 'Ключевая характеристика',
    name: 'Имя персонажа',
    namePlaceholder: 'Например, Ваэлис',
    nothingFound: 'Ничего не найдено',
    searchPlaceholder: 'Поиск…',
    showHomebrew: 'Использовать варианты из Homebrews'
  },
  es: {
    ancestry: 'Ascendencia',
    background: 'Trasfondo',
    buildId: 'ID de compilación',
    characterClass: 'Clase',
    heritage: 'Herencia',
    import: 'Importar desde Pathbuilder por ID',
    mainAbility: 'Característica clave',
    name: 'Nombre del personaje',
    namePlaceholder: 'Vaelis, por ejemplo',
    nothingFound: 'No se encontró nada',
    searchPlaceholder: 'Buscar…',
    showHomebrew: 'Usar opciones de Homebrew'
  }
}

const PATHFINDER2_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
  background: undefined, main_ability: undefined
}

export const Pathfinder2Form = (props) => {
  const [form, setForm] = createStore(PATHFINDER2_DEFAULT_FORM);
  const [importForm, setImportForm] = createStore({ use: false, service: 'pathbuilder_id', build_id: '' });
  const [settings, setSettings] = createStore({ showHomebrew: true });

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));
  const providerHomebrews = createMemo(() => props.homebrews?.pathfinder2 || {});

  const changeForm = (payload) => {
    const attributes = { ...form, ...payload };
    setForm(attributes);
    props.onChangeData(attributes);
  }

  const changeImportForm = (payload) => {
    const attributes = { ...importForm, ...payload };
    setImportForm(attributes);
    props.onChangeImport(attributes);
  }

  const pf2Backgrounds = createMemo(() => providerHomebrews().backgrounds || {});

  const pf2Classes = createMemo(() => {
    if (!settings.showHomebrew) return config.classes;

    const homebrewClasses = Object.entries(providerHomebrews().classes || {}).map(([key, value]) => {
      if (!value.subclass_title) return [key, value];

      return [key, { ...value, subclasses: providerHomebrews().subclasses?.[key] || {} }];
    });

    return { ...config.classes, ...Object.fromEntries(homebrewClasses) };
  });

  const pf2Races = createMemo(() => {
    if (!settings.showHomebrew) return config.races;

    const homebrewSubraces = providerHomebrews().subraces || {};
    const versatile = homebrewSubraces.versatile || {};

    const coreRaces = Object.entries(config.races).map(([key, value]) => [
      key,
      {
        ...value,
        subraces: { ...value.subraces, ...homebrewSubraces[key], ...versatile }
      }
    ]);

    const homebrewRaces = Object.entries(providerHomebrews().races || {}).map(([key, value]) => [
      key,
      {
        ...value,
        subraces: { ...homebrewSubraces[key], ...versatile }
      }
    ]);
    return { ...Object.fromEntries(coreRaces), ...Object.fromEntries(homebrewRaces) };
  });

  const mainAbilityOptions = createMemo(() => {
    const characterClass = pf2Classes()[form.main_class];
    if (!characterClass) return {};

    const classOptions = characterClass.main_ability_options || [];
    const subclassOptions = characterClass.subclasses?.[form.subclass]?.main_ability_options || [];
    const availableOptions = new Set([...classOptions, ...subclassOptions]);

    return Object.fromEntries(
      Object.entries(config.abilities)
        .filter(([key]) => availableOptions.has(key))
        .map(([key, value]) => [key, localize(value.name, locale())])
    );
  });

  const changeClass = (value) => {
    const characterClass = pf2Classes()[value];
    changeForm({
      main_class: value,
      main_ability: characterClass?.main_ability_options?.[0],
      subclass: undefined
    });
  }

  return (
    <>
      <Checkbox
        checked={importForm.use}
        label={i18n().import}
        onChange={(checked) => changeImportForm({ use: checked })}
      />
      <Show
        when={importForm.use}
        fallback={
          <>
            <Checkbox
              checked={settings.showHomebrew}
              label={i18n().showHomebrew}
              onChange={(checked) => setSettings({ showHomebrew: checked })}
            />
            <Input
              label={i18n().name}
              placeholder={i18n().namePlaceholder}
              value={form.name}
              onInput={(value) => changeForm({ name: value })}
            />
            <Select
              searchable
              emptyText={i18n().nothingFound}
              label={i18n().ancestry}
              options={translate(pf2Races(), locale(), true)}
              value={form.race}
              searchPlaceholder={i18n().searchPlaceholder}
              onSelect={(value) => changeForm({ race: value, subrace: undefined })}
            />
            <Show when={pf2Races()[form.race]?.subraces}>
              <Select
                label={i18n().heritage}
                options={translate(pf2Races()[form.race].subraces, locale())}
                value={form.subrace}
                onSelect={(value) => changeForm({ subrace: value })}
              />
            </Show>
            <Select
              searchable
              emptyText={i18n().nothingFound}
              label={i18n().background}
              options={translate(pf2Backgrounds(), locale(), true)}
              value={form.background}
              searchPlaceholder={i18n().searchPlaceholder}
              onSelect={(value) => changeForm({ background: value })}
            />
            <Select
              searchable
              emptyText={i18n().nothingFound}
              label={i18n().characterClass}
              options={translate(pf2Classes(), locale(), true)}
              value={form.main_class}
              searchPlaceholder={i18n().searchPlaceholder}
              onSelect={changeClass}
            />
            <Show when={pf2Classes()[form.main_class]?.subclasses}>
              <Select
                label={localize(pf2Classes()[form.main_class].subclass_title, locale())}
                options={translate(pf2Classes()[form.main_class].subclasses, locale())}
                value={form.subclass}
                onSelect={(value) => changeForm({ subclass: value })}
              />
            </Show>
            <Show when={Object.keys(mainAbilityOptions()).length > 1}>
              <Select
                label={i18n().mainAbility}
                options={mainAbilityOptions()}
                value={form.main_ability}
                onSelect={(value) => changeForm({ main_ability: value })}
              />
            </Show>
          </>
        }
      >
        <Input
          label={i18n().buildId}
          placeholder="111111"
          value={importForm.build_id}
          onInput={(value) => changeImportForm({ build_id: value })}
        />
      </Show>
    </>
  );
}
