import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button, Select } from '../../../../components';
import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';
import { translate } from '../../../../helpers';

export const NewDaggerheartSubclassForm = (props) => {
  const [subclassForm, setSubclassForm] = createStore({
    name: '',
    class_name: '',
    spellcast: null
  });

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const daggerheartClasses = createMemo(() => {
    const result = translate(config.classes, locale());
    if (props.homebrews === undefined) return result;

    return { ...result, ...props.homebrews.classes.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.subclassName')}
        value={subclassForm.name}
        onInput={(value) => setSubclassForm({ ...subclassForm, name: value })}
      />
      <Select
        containerClassList="mb-4"
        labelText={t('pages.homebrewPage.daggerheart.classForSubclass')}
        items={daggerheartClasses()}
        selectedValue={subclassForm.class_name}
        onSelect={(value) => setSubclassForm({ ...subclassForm, class_name: value })}
      />
      <Select
        containerClassList="mb-4"
        labelText={t('pages.homebrewPage.daggerheart.spellcastTrait')}
        items={translate(config.traits, locale())}
        selectedValue={subclassForm.spellcast}
        onSelect={(value) => setSubclassForm({ ...subclassForm, spellcast: value })}
      />
      <div class="flex gap-4 w-full">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: subclassForm })}>{t('save')}</Button>
      </div>
    </>
  );
}
