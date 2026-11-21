import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Checkbox, Input } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Character name',
    namePlaceholder: 'Vaelis, for example',
    import: 'Import from Pathbuilder by ID',
    buildId: 'Build ID'
  },
  ru: {
    name: 'Имя персонажа',
    namePlaceholder: 'Например, Ваэлис',
    import: 'Импорт из Pathbuilder по ID',
    buildId: 'Build ID'
  },
  es: {
    name: 'Nombre del personaje',
    namePlaceholder: 'Vaelis, por ejemplo',
    import: 'Importar desde Pathbuilder por ID',
    buildId: 'ID de compilación'
  }
}

const PATHFINDER2_DEFAULT_FORM = {
  name: '', race: undefined, subrace: undefined, main_class: undefined, subclass: undefined,
  background: undefined, main_ability: undefined
}

export const Pathfinder2Form = (props) => {
  const [form, setForm] = createStore(PATHFINDER2_DEFAULT_FORM);
  const [importForm, setImportForm] = createStore({ use: false, service: 'pathbuilder_id', build_id: '' });

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const changeForm = (payload) => {
    const attributes = { ...form, ...payload };
    setForm(attributes);
    props.onChangeData(attributes);
  }

  const changeImportForm = (payload) => {
    const attributes = { ...importForm, ...payload };
    setImportForm(attributes);
    props.onChangeImport(attributes);
  }

  return (
    <>
      <Checkbox
        checked={importForm.use}
        description={i18n().import}
        onChange={() => changeImportForm({ use: !importForm.use })}
      />
      <Show
        when={importForm.use}
        fallback={
          <Input
            label={i18n().name}
            placeholder={i18n().namePlaceholder}
            onInput={(value) => changeForm({ name: value })}
          />
        }
      >
        <Input
          label={i18n().buildId}
          placeholder="111111"
          onInput={(value) => changeImportForm({ build_id: value })}
        />
      </Show>
    </>
  );
}
