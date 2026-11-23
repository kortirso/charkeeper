import { createMemo, createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Checkbox, Input, Select } from '../../../components';
import config from '../../../data/daggerheart.json';
import { useAppLocale, useAppState } from '../../../context';
import { localize, translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    ancestry: 'Ancestry',
    ancestryName: 'Ancestry name',
    characterClass: 'Class',
    community: 'Community',
    customAncestry: 'Create a mixed ancestry',
    mainFeature: 'First ancestry feature',
    name: 'Character name',
    namePlaceholder: 'Vaelis, for example',
    nothingFound: 'Nothing found',
    searchPlaceholder: 'Search…',
    secondaryFeature: 'Second ancestry feature',
    showHomebrew: 'Allow Homebrew options',
    skipGuide: 'Skip new character hints',
    subclass: 'Subclass'
  },
  ru: {
    ancestry: 'Наследие',
    ancestryName: 'Название наследия',
    characterClass: 'Класс',
    community: 'Сообщество',
    customAncestry: 'Создать смешанное наследие',
    mainFeature: 'Первая способность наследия',
    name: 'Имя персонажа',
    namePlaceholder: 'Например, Ваэлис',
    nothingFound: 'Ничего не найдено',
    searchPlaceholder: 'Поиск…',
    secondaryFeature: 'Вторая способность наследия',
    showHomebrew: 'Использовать варианты из Homebrews',
    skipGuide: 'Пропустить подсказки для нового персонажа',
    subclass: 'Подкласс'
  },
  es: {
    ancestry: 'Ascendencia',
    ancestryName: 'Nombre de ascendencia',
    characterClass: 'Clase',
    community: 'Comunidad',
    customAncestry: 'Crear una ascendencia mixta',
    mainFeature: 'Primera característica de ascendencia',
    name: 'Nombre del personaje',
    namePlaceholder: 'Vaelis, por ejemplo',
    nothingFound: 'No se encontró nada',
    searchPlaceholder: 'Buscar…',
    secondaryFeature: 'Segunda característica de ascendencia',
    showHomebrew: 'Usar opciones de Homebrew',
    skipGuide: 'Saltar las pistas de nuevos personajes',
    subclass: 'Subclase'
  }
}

const DAGGERHEART_DEFAULT_FORM = {
  name: '', heritage: undefined, heritage_name: '', heritage_features: [], main_feature: undefined,
  secondary_feature: undefined, community: undefined, main_class: undefined, subclass: undefined, skip_guide: false
}

export const DaggerheartForm = (props) => {
  const [customHeritage, setCustomHeritage] = createSignal(false);
  const [form, setForm] = createStore(DAGGERHEART_DEFAULT_FORM);
  const [settings, setSettings] = createStore({ showHomebrew: true });

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));
  const providerHomebrews = createMemo(() => props.homebrews?.daggerheart || {});
  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales.daggerheart;
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;

    return locale();
  });

  const payloadFor = (attributes, useCustomHeritage = customHeritage()) => {
    if (useCustomHeritage) {
      return {
        ...attributes,
        heritage: undefined,
        main_feature: undefined,
        secondary_feature: undefined,
        heritage_features: [attributes.main_feature, attributes.secondary_feature]
      };
    }

    return {
      ...attributes,
      heritage_features: undefined,
      heritage_name: undefined,
      main_feature: undefined,
      secondary_feature: undefined
    };
  }

  const changeForm = (payload) => {
    const attributes = { ...form, ...payload };
    setForm(attributes);
    props.onChangeData(payloadFor(attributes));
  }

  const changeCustomHeritage = (checked) => {
    setCustomHeritage(checked);
    props.onChangeData(payloadFor(form, checked));
  }

  const daggerheartHeritages = createMemo(() => {
    if (!settings.showHomebrew) return config.heritages;

    return { ...config.heritages, ...(providerHomebrews().races || {}) };
  });

  const daggerheartCommunities = createMemo(() => {
    if (!settings.showHomebrew) return config.communities;

    return { ...config.communities, ...(providerHomebrews().communities || {}) };
  });

  const daggerheartClasses = createMemo(() => {
    if (!settings.showHomebrew) return config.classes;

    return { ...config.classes, ...(providerHomebrews().classes || {}) };
  });

  const daggerheartSubclasses = createMemo(() => {
    if (!form.main_class) return {};

    const coreSubclasses = config.classes[form.main_class]?.subclasses || {};
    if (!settings.showHomebrew) return coreSubclasses;

    return {
      ...coreSubclasses,
      ...(providerHomebrews().subclasses?.[form.main_class] || {})
    };
  });

  const heritageFeatures = createMemo(() => {
    const mainFeatures = {};
    const secondaryFeatures = {};

    Object.values(daggerheartHeritages())
      .filter((item) => (item.features || []).length > 1)
      .forEach((item) => {
        mainFeatures[item.features[0].slug] = `${localize(item.name, currentLocale())} — ${localize(item.features[0].name, currentLocale())}`;
        secondaryFeatures[item.features[1].slug] = `${localize(item.name, currentLocale())} — ${localize(item.features[1].name, currentLocale())}`;
      });

    return [mainFeatures, secondaryFeatures];
  });

  return (
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
      <Checkbox
        checked={customHeritage()}
        label={i18n().customAncestry}
        onChange={changeCustomHeritage}
      />
      <Show
        when={customHeritage()}
        fallback={
          <Select
            searchable
            emptyText={i18n().nothingFound}
            label={i18n().ancestry}
            options={translate(daggerheartHeritages(), currentLocale(), true)}
            value={form.heritage}
            searchPlaceholder={i18n().searchPlaceholder}
            onSelect={(value) => changeForm({ heritage: value })}
          />
        }
      >
        <Input
          label={i18n().ancestryName}
          value={form.heritage_name}
          onInput={(value) => changeForm({ heritage_name: value })}
        />
        <Select
          label={i18n().mainFeature}
          options={heritageFeatures()[0]}
          value={form.main_feature}
          onSelect={(value) => changeForm({ main_feature: value })}
        />
        <Select
          label={i18n().secondaryFeature}
          options={heritageFeatures()[1]}
          value={form.secondary_feature}
          onSelect={(value) => changeForm({ secondary_feature: value })}
        />
      </Show>
      <Select
        searchable
        emptyText={i18n().nothingFound}
        label={i18n().community}
        options={translate(daggerheartCommunities(), currentLocale(), true)}
        value={form.community}
        searchPlaceholder={i18n().searchPlaceholder}
        onSelect={(value) => changeForm({ community: value })}
      />
      <Select
        searchable
        emptyText={i18n().nothingFound}
        label={i18n().characterClass}
        options={translate(daggerheartClasses(), currentLocale(), true)}
        value={form.main_class}
        searchPlaceholder={i18n().searchPlaceholder}
        onSelect={(value) => changeForm({ main_class: value, subclass: undefined })}
      />
      <Show when={form.main_class}>
        <Select
          label={i18n().subclass}
          options={translate(daggerheartSubclasses(), currentLocale(), true)}
          value={form.subclass}
          onSelect={(value) => changeForm({ subclass: value })}
        />
      </Show>
      <Checkbox
        checked={form.skip_guide}
        label={i18n().skipGuide}
        onChange={(checked) => changeForm({ skip_guide: checked })}
      />
    </>
  );
}
