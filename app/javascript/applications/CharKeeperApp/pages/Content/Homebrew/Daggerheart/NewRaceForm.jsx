import { createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Button } from '../../../../components';
import { useAppLocale } from '../../../../context';

export const NewDaggerheartRaceForm = (props) => {
  const [name, setName] = createSignal('');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <Input
        containerClassList="mb-4"
        labelText={t('pages.homebrewPage.daggerheart.raceName')}
        value={name()}
        onInput={(value) => setName(value)}
      />
      <div class="flex gap-4 w-full">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: { name: name() } })}>{t('save')}</Button>
      </div>
    </>
  );
}
