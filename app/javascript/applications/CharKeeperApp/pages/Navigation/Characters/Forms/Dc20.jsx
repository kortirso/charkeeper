import { createEffect, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { CharacterForm, Dc20Ancestries } from '../../../../pages';
import { Select, Input, Checkbox } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppLocale, useAppAlert } from '../../../../context';
import { translate, readFromCache, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Name',
    ancestry: 'Ancestry',
    pointsLeft: 'Points left',
    class: 'Class',
    manyAncestriesAlert: 'Maximum 2 ancestries',
    minorTraitsAlert: 'Maximum 1 minor trait',
    negativeTraitsAlert: 'Maximum 2 negative traits',
    skipGuide: 'Skip new character guide'
  },
  ru: {
    name: 'Имя',
    ancestry: 'Родословная',
    pointsLeft: 'Очков осталось',
    class: 'Класс',
    manyAncestriesAlert: 'Максимум только 2 родословные',
    minorTraitsAlert: 'Максимум 1 малая черта',
    negativeTraitsAlert: 'Максимум 2 отрицательные черты',
    skipGuide: 'Пропустить настройку нового персонажа'
  }
}

const DC20_DEFAULT_FORM = { name: '', main_class: undefined, ancestry_feats: {}, ancestryPoints: 5, skip_guide: false };
const RENDER_GUIDE_CACHE_NAME = 'RenderGuideSettings';

export const Dc20CharacterForm = (props) => {
  const [characterDc20Form, setCharacterDc20Form] = createStore(DC20_DEFAULT_FORM);
  const [validations, setValidations] = createStore({ negativeTraits: 0, minorTraits: 0 });

  const [{ renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const readGuideSettings = async () => {
    const cacheValue = await readFromCache(RENDER_GUIDE_CACHE_NAME);
    const value = cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue);

    setCharacterDc20Form({ ...characterDc20Form, skip_guide: value.dc20 === false })
  }

  createEffect(() => {
    readGuideSettings();
  });

  const changeAncestries = (form, validationsForm) => {
    batch(() => {
      setCharacterDc20Form({ ...characterDc20Form, ...form });
      setValidations({ ...validationsForm });
    });
  }

  const saveCharacter = async () => {
    if (Object.keys(characterDc20Form.ancestry_feats).length > 2) return renderAlert(localize(TRANSLATION, locale()).manyAncestriesAlert);
    if (validations.negativeTraits > 2) return renderAlert(localize(TRANSLATION, locale()).negativeTraitsAlert);
    if (validations.minorTraits > 1) return renderAlert(localize(TRANSLATION, locale()).minorTraitsAlert);

    const result = await props.onCreateCharacter(characterDc20Form);

    if (result === null) {
      batch(() => {
        setCharacterDc20Form({ name: '', main_class: undefined, ancestryPoints: 5, ancestry_feats: {}, skip_guide: true });
        setValidations({ negativeTraits: 0, minorTraits: 0 });
      });
    }
  }

  return (
    <CharacterForm setCurrentTab={props.setCurrentTab} onSaveCharacter={saveCharacter}>
      <Input
        containerClassList="mb-2"
        labelText={localize(TRANSLATION, locale())['name']}
        value={characterDc20Form.name}
        onInput={(value) => setCharacterDc20Form({ ...characterDc20Form, name: value })}
      />
      <Select
        containerClassList="mb-4"
        labelText={localize(TRANSLATION, locale())['class']}
        items={translate(config.classes, locale())}
        selectedValue={characterDc20Form.main_class}
        onSelect={(value) => setCharacterDc20Form({ ...characterDc20Form, main_class: value })}
      />
      <Dc20Ancestries forNewCharacter onUpdateForm={changeAncestries} />
      <Checkbox
        labelText={localize(TRANSLATION, locale()).skipGuide}
        labelPosition="right"
        labelClassList="ml-2"
        checked={characterDc20Form.skip_guide}
        classList="mt-4"
        onToggle={() => setCharacterDc20Form({ ...characterDc20Form, skip_guide: !characterDc20Form.skip_guide })}
      />
    </CharacterForm>
  );
}
