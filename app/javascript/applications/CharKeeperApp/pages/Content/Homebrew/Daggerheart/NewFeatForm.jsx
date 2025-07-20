import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, TextArea, Select, Button } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { translate } from '../../../../helpers';

export const NewDaggerheartFeatForm = (props) => {
  const [featForm, setFeatForm] = createStore({
    title: '',
    description: '',
    origin: '',
    origin_value: '',
    kind: '',
    limit: null,
    limit_refresh: null
  });

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const daggerheartHeritages = createMemo(() => {
    if (props.homebrews === undefined) return [];

    return props.homebrews.daggerheart.heritages;
  });

  const daggerheartClasses = createMemo(() => {
    if (props.homebrews === undefined) return [];

    return props.homebrews.daggerheart.classes;
  });

  const originValues = createMemo(() => {
    if (featForm.origin === 'ancestry') return daggerheartHeritages();
    if (featForm.origin === 'class') return daggerheartClasses();
    
    return [];
  });

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.featTitle')}
        value={featForm.title}
        onInput={(value) => setFeatForm({ ...featForm, title: value })}
      />
      <TextArea
        rows="5"
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.featDescription')}
        value={featForm.description}
        onChange={(value) => setFeatForm({ ...featForm, description: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.origin')}
        items={dict().daggerheart.terms.feats.origins}
        selectedValue={featForm.origin}
        onSelect={(value) => setFeatForm({ ...featForm, origin: value, origin_value: '' })}
      />
      <Show when={featForm.origin}>
        <Select
          containerClassList="mb-2"
          labelText={t('pages.homebrewPage.daggerheart.originValue')}
          items={translate(originValues(), locale())}
          selectedValue={featForm.origin_value}
          onSelect={(value) => setFeatForm({ ...featForm, origin_value: value })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.kind')}
        items={dict().daggerheart.terms.feats.kinds}
        selectedValue={featForm.kind}
        onSelect={(value) => setFeatForm({ ...featForm, kind: value })}
      />
      <Input
        nemeric
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.limit')}
        value={featForm.limit}
        onInput={(value) => setFeatForm({ ...featForm, limit: value })}
      />
      <Show when={featForm.limit}>
        <Select
          containerClassList="mb-2"
          labelText={t('pages.homebrewPage.daggerheart.limitRefresh')}
          items={dict().daggerheart.terms.feats.limitRefresh}
          selectedValue={featForm.limit_refresh}
          onSelect={(value) => setFeatForm({ ...featForm, limit_refresh: value })}
        />
      </Show>
      <div class="flex gap-4 w-full mt-4">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: Object.fromEntries(Object.entries(featForm).filter(([, value]) => value !== null)) })}>{t('save')}</Button>
      </div>
    </>
  );
}

