import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import config from '../../../CharKeeperApp/data/daggerheart.json';

import { Input, Button, Select, TextArea } from '../../components';
import { useAppLocale } from '../../context';
import { translate } from '../../helpers';

const TRANSLATION = {
  en: {
    save: 'Save',
    cancel: 'Cancel',
    formTitle: 'Feature editing',
    title: 'Feature title',
    description: 'Feature description',
    kind: 'Feature kind',
    limit: 'Usage limit',
    limitRefresh: 'Limit refresh'
  },
  ru: {
    save: 'Сохранить',
    cancel: 'Отменить',
    formTitle: 'Редактирование способности',
    title: 'Название',
    description: 'Описание',
    kind: 'Тип',
    limit: 'Лимит использований',
    limitRefresh: 'Обновление лимита'
  }
}

export const DaggerheartFeat = (props) => {
  const [featForm, setFeatForm] = createStore({
    title: '',
    description: '',
    origin: props.origin || '',
    origin_value: props.originValue || '',
    kind: 'static',
    limit: null,
    limit_refresh: null,
    subclass_mastery: 1,
    level: 1
  });

  const [locale] = useAppLocale();

  const daggerheartHeritages = createMemo(() => {
    const result = translate(config.heritages, locale());
    if (props.homebrews === undefined) return result;

    return { ...result, ...props.homebrews.races.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  const daggerheartClasses = createMemo(() => {
    const result = translate(config.classes, locale());
    if (props.homebrews === undefined) return result;

    return { ...result, ...props.homebrews.classes.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  const daggerheartSubclasses = createMemo(() => {
    if (props.homebrews === undefined) return [];

    return props.homebrews.subclasses.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
  });

  const daggerheartCommunities = createMemo(() => {
    const result = translate(config.communities, locale());
    if (props.homebrews === undefined) return result;

    return { ...result, ...props.homebrews.communities.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {}) };
  });

  const daggerheartTransformations = createMemo(() => {
    if (props.homebrews === undefined) return {};

    return props.homebrews.transformations.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
  });

  const daggerheartDomains = createMemo(() => {
    if (props.homebrews === undefined) return {};

    return props.homebrews.domains.reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
  });

  const daggerheartCharacters = createMemo(() => {
    if (props.characters === undefined) return [];

    return props.characters.filter((item) => item.provider === 'daggerheart').reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
  });

  const originValues = createMemo(() => {
    if (featForm.origin === 'ancestry') return daggerheartHeritages();
    if (featForm.origin === 'class') return daggerheartClasses();
    if (featForm.origin === 'subclass') return daggerheartSubclasses();
    if (featForm.origin === 'community') return daggerheartCommunities();
    if (featForm.origin === 'character') return daggerheartCharacters();
    if (featForm.origin === 'transformation') return daggerheartTransformations();
    if (featForm.origin === 'domain_card') return daggerheartDomains();
    
    return [];
  });

  return (
    <>
      <p class="mb-2 text-xl">{TRANSLATION[locale()]['formTitle']}</p>
      <Input
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['title']}
        value={featForm.title}
        onInput={(value) => setFeatForm({ ...featForm, title: value })}
      />
      <TextArea
        rows="5"
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['description']}
        value={featForm.description}
        onChange={(value) => setFeatForm({ ...featForm, description: value })}
      />
      <Show when={props.origin === undefined}>
        <Select
          containerClassList="mb-2"
          labelText="Origin"
          items={[]}
          selectedValue={featForm.origin}
          onSelect={(value) => setFeatForm({ ...featForm, origin: value, origin_value: '' })}
        />
      </Show>
      <Show when={props.originValue === undefined && featForm.origin}>
        <Select
          containerClassList="mb-2"
          labelText="Origin value"
          items={originValues()}
          selectedValue={featForm.origin_value}
          onSelect={(value) => setFeatForm({ ...featForm, origin_value: value })}
        />
      </Show>
      <Show when={featForm.origin === 'subclass'}>
        <Select
          containerClassList="mb-2"
          labelText="Subclass mastery"
          items={{ 1: 'Foundation', 2: 'Specialization', 3: 'Mastery' }}
          selectedValue={featForm.subclass_mastery}
          onSelect={(value) => setFeatForm({ ...featForm, subclass_mastery: value })}
        />
      </Show>
      <Show when={featForm.origin === 'domain_card'}>
        <Input
          containerClassList="mb-2"
          labelText=""
          value={featForm.level}
          onInput={(value) => setFeatForm({ ...featForm, level: parseInt(value) })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['kind']}
        items={translate({ "static": { "name": { "en": "Static text", "ru": "Вывод описания" } }, "text": { "name": { "en": "Text area", "ru": "С вводом данных" } } }, locale())}
        selectedValue={featForm.kind}
        onSelect={(value) => setFeatForm({ ...featForm, kind: value })}
      />
      <Input
        nemeric
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['limit']}
        value={featForm.limit}
        onInput={(value) => setFeatForm({ ...featForm, limit: value })}
      />
      <Show when={featForm.limit}>
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()]['limitRefresh']}
          items={translate({ "short_rest": { "name": { "en": "Short rest", "ru": "Короткий отдых" } }, "long_rest": { "name": { "en": "Long rest", "ru": "Продолжительный отдых" } }, "session": { "name": { "en": "Session", "ru": "После сессии" } } }, locale())}
          selectedValue={featForm.limit_refresh}
          onSelect={(value) => setFeatForm({ ...featForm, limit_refresh: value })}
        />
      </Show>
      <div class="flex justify-end gap-4 mt-4">
        <Button default classList="py-1 px-2" onClick={props.onCancel}>{TRANSLATION[locale()]['cancel']}</Button>
        <Button default classList="py-1 px-2" onClick={() => props.onSave({ brewery: Object.fromEntries(Object.entries(featForm).filter(([, value]) => value !== null)) })}>{TRANSLATION[locale()]['save']}</Button>
      </div>
    </>
  );
}
