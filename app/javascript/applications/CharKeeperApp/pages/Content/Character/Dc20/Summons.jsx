import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { ErrorWrapper, GuideWrapper, Toggle, Button, Input, IconButton, Select } from '../../../../components';
import { Close } from '../../../../assets';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { localize, apiRequest, options, performResponse, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    newForm: 'Add Summon',
    name: 'Name',
    save: 'Save',
    cancel: 'Cancel',
    kind: 'Kind'
  },
  ru: {
    newForm: 'Добавить прислужника',
    name: 'Название',
    save: 'Сохранить',
    cancel: 'Отменить',
    kind: 'Вид'
  }
}

const fetchSummonsRequest = async (accessToken, characterId) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/summons.json`,
    options: options('GET', accessToken)
  });
}

const createSummonRequest = async (accessToken, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/summons.json`,
    options: options('POST', accessToken, payload)
  });
}

const removeSummonRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/frontend/dc20/characters/${characterId}/summons/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const Dc20Summons = (props) => {
  const character = () => props.character;

  const [lastCharacterId, setLastCharacterId] = createSignal(undefined);
  const [createMode, setCreateMode] = createSignal(false);

  const [summons, setSummons] = createSignal(undefined);

  const [form, setForm] = createStore({ name: '', kind: null });

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastCharacterId() === character().id) return;

    const fetchSummons = async () => await fetchSummonsRequest(appState.accessToken, character().id);

    Promise.all([fetchSummons()]).then(
      ([summonsData]) => {
        batch(() => {
          setSummons(summonsData.summons);
        });
      }
    );

    setLastCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const createSummon = async () => {
    const result = await createSummonRequest(appState.accessToken, character().id, { summon: form });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          setSummons([result.summon].concat(summons()));
          setCreateMode(false);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const removeSummon = async (event, id) => {
    event.stopPropagation();

    const result = await removeSummonRequest(appState.accessToken, character().id, id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        setSummons(summons().filter((item) => item.id !== id));
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Summons' }}>
      <GuideWrapper character={character()}>
        <Show
          when={!createMode()}
          fallback={
            <div class="blockable blockable-padding">
              <Input labelText={i18n().name} value={form.name} onInput={(value) => setForm({ ...form, name: value })} />
              <Select
                containerClassList="mt-4"
                labelText={i18n().kind}
                items={translate(config.summons, locale(), true)}
                selectedValue={form.kind}
                onSelect={(value) => setForm({ ...form, kind: value })}
              />
              <div class="flex justify-end mt-4 gap-4">
                <Button outlined textable size="small" onClick={() => setCreateMode(false)}><span>{i18n().cancel}</span></Button>
                <Button default textable size="small" onClick={createSummon}><span>{i18n().save}</span></Button>
              </div>
            </div>
          }
        >
          <Button default textable classList="mb-2 uppercase" onClick={() => setCreateMode(true)}><span>{i18n().newForm}</span></Button>
          <Show when={summons() !== undefined}>
            <For each={summons()}>
              {(summon) =>
                <Toggle title={
                  <div class="flex items-center">
                    <p class="flex-1">{localize(config.summons[summon.data.kind].name, locale())} {summon.name}</p>
                    <IconButton onClick={(e) => removeSummon(e, summon.id)}><Close /></IconButton>
                  </div>
                }>
                  <div class="flex flex-col gap-2" />
                </Toggle>
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
