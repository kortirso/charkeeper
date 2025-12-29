import { createSignal, createMemo, createEffect, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CharacterForm } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import daggerheartConfig from '../../../../data/daggerheart.json';
import { useAppLocale } from '../../../../context';
import { translate, readFromCache } from '../../../../helpers';

const DAGGERHEART_DEFAULT_FORM = {
  name: '', heritage: undefined, heritage_name: '', heritage_features: [], main_feature: undefined,
  secondary_feature: undefined, community: undefined, main_class: undefined, subclass: undefined, skip_guide: false
};
const RENDER_GUIDE_CACHE_NAME = 'RenderGuideSettings';

const TRANSLATION = {
  en: {
    options: 'There are books available in Homebrews/Modules section for additional options for character creation.',
    skipGuide: 'Skip new character guide'
  },
  ru: {
    options: 'В разделе Homebrews/Модули доступны книги для расширения возможных вариантов при создании персонажа.',
    skipGuide: 'Пропустить настройку нового персонажа'
  }
}

export const DaggerheartCharacterForm = (props) => {
  const [customHeritage, setCustomHeritage] = createSignal(false);

  const [characterDaggerheartForm, setCharacterDaggerheartForm] = createStore(DAGGERHEART_DEFAULT_FORM);

  const [locale, dict] = useAppLocale();
  const t = i18n.translator(dict);

  const readGuideSettings = async () => {
    const cacheValue = await readFromCache(RENDER_GUIDE_CACHE_NAME);
    const value = cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue);

    setCharacterDaggerheartForm({ ...characterDaggerheartForm, skip_guide: value.daggerheart === false })
  }

  createEffect(() => {
    readGuideSettings();
  });

  const daggerheartHeritages = createMemo(() => {
    if (props.homebrews() === undefined) return {};

    return { ...daggerheartConfig.heritages, ...props.homebrews().daggerheart.races };
  });

  const daggerheartCommunities = createMemo(() => {
    if (props.homebrews() === undefined) return {};

    return { ...daggerheartConfig.communities, ...props.homebrews().daggerheart.communities };
  });

  const daggerheartClasses = createMemo(() => {
    if (props.homebrews() === undefined) return {};

    return { ...daggerheartConfig.classes, ...props.homebrews().daggerheart.classes };
  });

  const daggerheartSubclasses = createMemo(() => {
    if (!characterDaggerheartForm.main_class) return {};
    if (props.homebrews() === undefined) return {};

    return {
      ...(daggerheartConfig.classes[characterDaggerheartForm.main_class]?.subclasses || {}),
      ...(props.homebrews().daggerheart.subclasses[characterDaggerheartForm.main_class] || {})
    };
  });

  const heritageFeatures = createMemo(() => {
    const mainFeatures = {};
    const secondaryFeatures = {};

    Object.values(daggerheartHeritages()).filter((item) => item.features.length > 1).forEach((item) => {
      mainFeatures[item.features[0].slug] = `${item.name[locale()]} - ${item.features[0].name[locale()]}`;
      secondaryFeatures[item.features[1].slug] = `${item.name[locale()]} - ${item.features[1].name[locale()]}`;
    })

    return [mainFeatures, secondaryFeatures];
  });

  const saveCharacter = async () => {
    let characterFormData = null;

    if (customHeritage()) {
      const heritage_features = [characterDaggerheartForm.main_feature, characterDaggerheartForm.secondary_feature];

      characterFormData = {
        ...characterDaggerheartForm, heritage: undefined, main_feature: undefined, secondary_feature: undefined, heritage_features: heritage_features
      }
    } else {
      characterFormData = {
        ...characterDaggerheartForm, heritage_features: undefined, heritage_name: undefined, main_feature: undefined, secondary_feature: undefined
      }
    }

    const result = await props.onCreateCharacter(characterFormData);

    if (result === null) {
      setCharacterDaggerheartForm({
        name: '', heritage: undefined, heritage_name: '', heritage_features: [], main_feature: undefined,
        secondary_feature: undefined, community: undefined, main_class: undefined, subclass: undefined, skip_guide: true
      });
    }
  }

  return (
    <CharacterForm loading={props.loading} setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <p class="dark:text-snow mb-2">{TRANSLATION[locale()]['options']}</p>
      <Input
        containerClassList="mb-2"
        labelText={t('newCharacterPage.name')}
        value={characterDaggerheartForm.name}
        onInput={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, name: value })}
      />
      <Checkbox
        labelText={t('newCharacterPage.daggerheart.customAncestry')}
        labelPosition="right"
        labelClassList="ml-2"
        checked={customHeritage()}
        classList="mr-1"
        onToggle={() => setCustomHeritage(!customHeritage())}
      />
      <Show
        when={customHeritage()}
        fallback={
          <Select
            containerClassList="mb-2"
            labelText={t('newCharacterPage.daggerheart.ancestry')}
            items={translate(daggerheartHeritages(), locale())}
            selectedValue={characterDaggerheartForm.heritage}
            onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, heritage: value })}
          />
        }
      >
        <Input
          containerClassList="mb-2"
          labelText={t('newCharacterPage.daggerheart.ancestryName')}
          value={characterDaggerheartForm.heritage_name}
          onInput={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, heritage_name: value })}
        />
        <Select
          containerClassList="mb-2"
          labelText={t('newCharacterPage.daggerheart.mainFeature')}
          items={heritageFeatures()[0]}
          selectedValue={characterDaggerheartForm.main_feature}
          onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, main_feature: value })}
        />
        <Select
          containerClassList="mb-2"
          labelText={t('newCharacterPage.daggerheart.secondaryFeature')}
          items={heritageFeatures()[1]}
          selectedValue={characterDaggerheartForm.secondary_feature}
          onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, secondary_feature: value })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.daggerheart.community')}
        items={translate(daggerheartCommunities(), locale())}
        selectedValue={characterDaggerheartForm.community}
        onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, community: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('newCharacterPage.daggerheart.mainClass')}
        items={translate(daggerheartClasses(), locale())}
        selectedValue={characterDaggerheartForm.main_class}
        onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, main_class: value, subclass: undefined })}
      />
      <Show when={characterDaggerheartForm.main_class}>
        <Select
          containerClassList="mb-2"
          labelText={t('newCharacterPage.daggerheart.subclass')}
          items={translate(daggerheartSubclasses(), locale())}
          selectedValue={characterDaggerheartForm.subclass}
          onSelect={(value) => setCharacterDaggerheartForm({ ...characterDaggerheartForm, subclass: value })}
        />
      </Show>
      <Checkbox
        labelText={TRANSLATION[locale()].skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterDaggerheartForm.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterDaggerheartForm({ ...characterDaggerheartForm, skip_guide: !characterDaggerheartForm.skip_guide })}
      />
    </CharacterForm>
  );
}
