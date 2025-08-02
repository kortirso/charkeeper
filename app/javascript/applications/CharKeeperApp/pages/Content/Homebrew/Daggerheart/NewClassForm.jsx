import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button, Select } from '../../../../components';
import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';
import { translate } from '../../../../helpers';

export const NewDaggerheartClassForm = (props) => {
  const [classForm, setClassForm] = createStore({
    name: '',
    domains: [],
    evasion: 10,
    health_max: 6
  });

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateMultiFeatureValue = (value) => {
    const currentValues = classForm.domains;
    const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
    setClassForm({ ...classForm, domains: newValue });
  }

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.className')}
        value={classForm.name}
        onInput={(value) => setClassForm({ ...classForm, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.evasion')}
        items={{ 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12 }}
        selectedValue={classForm.evasion}
        onSelect={(value) => setClassForm({ ...classForm, evasion: parseInt(value) })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.maxHealth')}
        items={{ 4: 4, 5: 5, 6: 6, 7: 7, 8: 8 }}
        selectedValue={classForm.health_max}
        onSelect={(value) => setClassForm({ ...classForm, health_max: parseInt(value) })}
      />
      <Select
        multi
        containerClassList="mb-4"
        labelText={t('pages.homebrewPage.daggerheart.domains')}
        items={translate(config.domains, locale())}
        selectedValues={classForm.domains}
        onSelect={(value) => updateMultiFeatureValue(value)}
      />
      <div class="flex gap-4 w-full">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: classForm })}>{t('save')}</Button>
      </div>
    </>
  );
}
