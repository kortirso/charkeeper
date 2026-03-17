import { createSignal, createEffect, Show, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Input, Button, Select, TextArea } from '../../../components';
import { useAppLocale } from '../../../context';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    markdown: 'You can use Markdown for editing description',
    save: 'Save',
    cancel: 'Cancel',
    formTitle: 'Feature editing',
    title: 'Feature title',
    description: 'Feature description',
    kind: 'Feature kind',
    limit: 'Usage limit',
    limitRefresh: 'Limit refresh',
    level: 'Level'
  },
  ru: {
    markdown: 'Вы можете использовать Markdown для редактирования описания',
    save: 'Сохранить',
    cancel: 'Отменить',
    formTitle: 'Редактирование способности',
    title: 'Название',
    description: 'Описание',
    kind: 'Тип',
    limit: 'Лимит использований',
    limitRefresh: 'Обновление лимита',
    level: 'Уровень'
  }
}

export const DndFeatForm = (props) => {
  const [featForm, setFeatForm] = createStore({
    title: '',
    description: '',
    origin: props.origin || '',
    origin_value: props.originValue || '',
    kind: 'static',
    limit: null,
    limit_refresh: null,
    level: 1
  });

  const [featureId, setFeatureId] = createSignal(undefined);

  const [locale] = useAppLocale();

  createEffect(() => {
    if (props.feature && featureId() !== props.feature) {
      batch(() => {
        setFeatForm({ ...props.feature, title: props.feature.title.en, description: props.feature.description.en });
        setFeatureId(props.feature.id)
      });
    }
  });

  const save = () => {
    props.onSave({
      brewery: Object.fromEntries(Object.entries(featForm).filter(([, value]) => value !== null))
    });
  }

  return (
    <>
      <p class="mb-2 text-xl">{TRANSLATION[locale()].formTitle}</p>
      <Input
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()].title}
        value={featForm.title}
        onInput={(value) => setFeatForm({ ...featForm, title: value })}
      />
      <TextArea
        rows="5"
        containerClassList="mb-1"
        labelText={TRANSLATION[locale()].description}
        value={featForm.description}
        onChange={(value) => setFeatForm({ ...featForm, description: value })}
      />
      <p class="mb-2 text-sm">{TRANSLATION[locale()].markdown}</p>
      <Input
        numeric
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()].level}
        value={featForm.level}
        onInput={(value) => setFeatForm({ ...featForm, level: parseInt(value) })}
      />
      <Select
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()].kind}
        items={translate({ "static": { "name": { "en": "Static text", "ru": "Вывод описания" } }, "text": { "name": { "en": "Text area", "ru": "С вводом данных" } } }, locale())}
        selectedValue={featForm.kind}
        onSelect={(value) => setFeatForm({ ...featForm, kind: value })}
      />
      <Show when={featForm.limit}>
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].limitRefresh}
          items={translate({ "short_rest": { "name": { "en": "Short rest", "ru": "Короткий отдых" } }, "long_rest": { "name": { "en": "Long rest", "ru": "Продолжительный отдых" } }, "one_at_short_rest": { "name": { "en": "One at short rest", "ru": "Один при коротком отдыхе" } } }, locale())}
          selectedValue={featForm.limit_refresh}
          onSelect={(value) => setFeatForm({ ...featForm, limit_refresh: value })}
        />
      </Show>
      <Input
        nemeric
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()].limit}
        value={featForm.limit}
        onInput={(value) => setFeatForm({ ...featForm, limit: value })}
      />
      <div class="flex justify-end gap-4 mt-4">
        <Button default classList="py-1 px-2" onClick={props.onCancel}>{TRANSLATION[locale()].cancel}</Button>
        <Button default classList="py-1 px-2" onClick={save}>{TRANSLATION[locale()].save}</Button>
      </div>
    </>
  );
}
