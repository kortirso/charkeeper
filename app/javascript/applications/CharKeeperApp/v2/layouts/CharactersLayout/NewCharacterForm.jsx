import { createEffect, createSignal, createMemo, Switch, Match, batch } from 'solid-js';

import { Pathfinder2Form, DaggerheartForm } from '../../layouts';
import { Button, Select } from '../../components';
import { useAppLocale, useAppState } from '../../context';
import { isSuccessResponse, localize, apiRequest, options, performResponse } from '../../helpers';

import { fetchHomebrewsRequest } from './api';

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

export const createCharacterRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters.json`,
    options: options('POST', accessToken, payload)
  });
}

export const importCharacterRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/characters/import.json',
    options: options('POST', accessToken, payload)
  });
}

export const NewCharacterForm = (props) => {
  const [platform, setPlatform] = createSignal(undefined);
  const [platformData, setPlatformData] = createSignal({});
  const [importData, setImportData] = createSignal({});
  const [homebrews, setHomebrews] = createSignal(undefined);

  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  createEffect(() => {
    if (homebrews() !== undefined) return;
    if (appState.accessToken === undefined) return;

    fetchHomebrewsRequest(appState.accessToken).then((result) => {
      setHomebrews(isSuccessResponse(result) ? result : {});
    });
  });

  const changePlatform = (value) => {
    batch(() => {
      setPlatformData({});
      setImportData({});
      setPlatform(value);
    });
  }

  const addCharacter = (character) => {
    props.onAddCharacter(character);
    changePlatform(undefined);
  }

  const saveCharacter = () => importData()?.use ? importCharacter() : createCharacter();

  const importCharacter = async () => {
    if (platform() === undefined) return;

    const { use, service, ...newImportData } = importData(); // eslint-disable-line no-unused-vars
    const result = await importCharacterRequest(appState.accessToken, { provider: platform(), service: importData().service, data: newImportData });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        addCharacter(result.character)
      }
    );
  }

  const createCharacter = async () => {
    if (platform() === undefined) return;

    const formData = Object.fromEntries(Object.entries(platformData()).filter(([, value]) => value !== undefined));
    const result = await createCharacterRequest(appState.accessToken, platform(), { character: formData });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        addCharacter(result.character)
      }
    );
  }

  return (
    <div class="new-character-form">
      <div class="new-character-form-content">
        <Select
          label={i18n().system}
          options={{ pathfinder2: 'Pathfinder 2', daggerheart: 'Daggerheart' }}
          onSelect={changePlatform}
          value={platform()}
        />
        <Switch>
          <Match when={platform() === 'pathfinder2'}>
            <Pathfinder2Form homebrews={homebrews()} onChangeData={setPlatformData} onChangeImport={setImportData} />
          </Match>
          <Match when={platform() === 'daggerheart'}>
            <DaggerheartForm homebrews={homebrews()} onChangeData={setPlatformData} />
          </Match>
        </Switch>
      </div>
      <div class="new-character-form-footer">
        <Button variant="secondary" class="new-character-form-footer-action" onClick={props.onCancel}>{i18n().cancel}</Button>
        <Button class="new-character-form-footer-action" onClick={saveCharacter}>{i18n().save}</Button>
      </div>
    </div>
  );
}
