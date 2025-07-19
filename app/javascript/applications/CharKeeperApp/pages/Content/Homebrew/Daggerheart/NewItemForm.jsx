import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Select, Button } from '../../../../components';
import { useAppLocale } from '../../../../context';

export const NewDaggerheartItemForm = (props) => {
  const [itemForm, setItemForm] = createStore({
    name: '',
    kind: ''
  });

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.itemName')}
        value={itemForm.name}
        onInput={(value) => setItemForm({ ...itemForm, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.itemKind')}
        items={dict().daggerheart.terms.items.kinds}
        selectedValue={itemForm.kind}
        onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
      />
      <div class="flex gap-4 w-full mt-4">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: Object.fromEntries(Object.entries(itemForm).filter(([, value]) => value !== null)) })}>{t('save')}</Button>
      </div>
    </>
  );
}

