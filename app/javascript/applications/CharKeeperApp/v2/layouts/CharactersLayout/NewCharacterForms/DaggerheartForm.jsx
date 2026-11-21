import { createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Input } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    name: 'Character name',
    namePlaceholder: 'Vaelis, for example'
  },
  ru: {
    name: 'Имя персонажа',
    namePlaceholder: 'Например, Ваэлис'
  },
  es: {
    name: 'Nombre del personaje',
    namePlaceholder: 'Vaelis, por ejemplo'
  }
}

export const DaggerheartForm = (props) => {
  const [form, setForm] = createStore({});

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const changeForm = (payload) => {
    const attributes = { ...form, ...payload };
    setForm(attributes);
    props.onChangeData(attributes);
  }

  return (
    <>
      <Input
        label={i18n().name}
        placeholder={i18n().namePlaceholder}
        onInput={(value) => changeForm({ name: value })}
      />
    </>
  );
}
