import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Pathfinder2Form, DaggerheartForm } from '../../layouts';
import { Button, Select } from '../../components';
import { useAppLocale } from '../../context';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    system: 'Game system',
    cancel: 'Cancel',
    save: 'Create character'
  },
  ru: {
    system: 'Игровая система',
    cancel: 'Отмена',
    save: 'Создать персонажа'
  },
  es: {
    system: 'Sistema de juego',
    cancel: 'Cancelar',
    save: 'Crear personaje'
  }
}

export const NewCharacterForm = (props) => {
  const [platform, setPlatform] = createSignal(undefined);
  const [platformData, setPlatformData] = createStore({});
  const [importData, setImportData] = createStore({});

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const saveCharacter = () => {
    console.log(platform());
    console.log(platformData.name);
    console.log(Object.entries(importData));
  }

  return (
    <div class="new-character-form">
      <div class="new-character-form-content">
        <Select
          label={i18n().system}
          options={[{ label: 'Pathfinder 2', value: 'pathfinder2' }, { label: 'Daggerheart', value: 'daggerheart' }]}
          onSelect={setPlatform}
          value={platform()}
        />
        <Switch>
          <Match when={platform() === 'pathfinder2'}><Pathfinder2Form onChangeData={setPlatformData} onChangeImport={setImportData} /></Match>
          <Match when={platform() === 'daggerheart'}><DaggerheartForm onChangeData={setPlatformData} onChangeImport={setImportData} /></Match>
        </Switch>
      </div>
      <div class="new-character-form-footer">
        <Button variant="secondary" class="new-character-form-footer-action" onClick={props.onCancel}>{i18n().cancel}</Button>
        <Button class="new-character-form-footer-action" onClick={saveCharacter}>{i18n().save}</Button>
      </div>
    </div>
  );
}
