import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { Button, Input, ErrorWrapper, Toggle, GuideWrapper, Select } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Plus, Minus, Close, Check } from '../../../../assets';
import { fetchProviderConfigRequest } from '../../../../requests/fetchProviderConfigRequest';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Conditions'
  },
  ru: {
    title: 'Состояния'
  }
}

export const Dc20Conditions = (props) => {
  const character = () => props.character;

  const [lastCharacterId, setLastCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [condition, setCondition] = createSignal(null);
  const [conditionValue, setConditionValue] = createSignal(1);

  const [conditions, setConditions] = createSignal(undefined); // все состояния
  const [currentConditions, setCurrentConditions] = createSignal({}); // состояния персонажа

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastCharacterId() === character().id) return;

    const fetchConditions = async () => await fetchProviderConfigRequest(appState.accessToken, 'dc20', 'conditions');

    Promise.all([fetchConditions()]).then(
      ([conditionsData]) => {
        if (!conditionsData.errors) {
          setConditions(conditionsData.conditions);
        }
      }
    );

    batch(() => {
      setLastCharacterId(character().id);
      setCurrentConditions(character().conditions_v2)
    });
  });

  const availableConditions = createMemo(() => {
    if (!conditions()) return {};

    const currentConditionKeys = Object.keys(currentConditions());
    return Object.fromEntries(
      Object.entries(conditions()).filter(([slug]) => !currentConditionKeys.includes(slug)).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([slug, values]) => [slug, values.name])
    )
  });

  const cancelEditing = () => setEditMode(false);

  const addCondition = () => {
    const value = parseInt(conditionValue());
    if (value <= 0) return;

    const payload = { ...currentConditions(), [condition()]: value };
    batch(() => {
      setCurrentConditions(payload);
      cancelEditing();
    });
    saveConditions({ conditions_v2: payload });
  }

  const removeCondition = (conditionSlug) => {
    const payload = Object.fromEntries(Object.entries(currentConditions()).filter(([slug]) => slug !== conditionSlug));
    setCurrentConditions(payload);
    saveConditions({ conditions_v2: payload });
  }

  const changeCondition = (conditionSlug, value) => {
    const currentValue = currentConditions()[conditionSlug];
    if (currentValue <= 1 && value === -1) return removeCondition(conditionSlug);

    const payload = { ...currentConditions(), [conditionSlug]: currentValue + value };
    setCurrentConditions(payload);
    saveConditions({ conditions_v2: payload });
  }

  const saveConditions = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Conditions' }}>
      <GuideWrapper character={character()}>
        <Toggle
          disabled
          isOpen
          title={
            <div class="flex justify-between items-center">
              <h2 class="flex-1 text-lg dark:text-snow">{localize(TRANSLATION, locale()).title}</h2>
              <Show when={!editMode()}>
                <Button default size="small" onClick={() => setEditMode(true)}><Plus /></Button>
              </Show>
            </div>
          }
        >
          <div class="flex flex-col gap-4">
            <Show when={editMode()}>
              <div class="flex items-center gap-2">
                <Select
                  containerClassList="flex-1"
                  items={availableConditions()}
                  selectedValue={condition()}
                  onSelect={setCondition}
                />
                <Show when={condition() && conditions()[condition()].value}>
                  <Input
                    containerClassList="flex-1"
                    value={conditionValue()}
                    onInput={setConditionValue}
                  />
                </Show>
                <Show when={condition()}>
                  <Button outlined onClick={cancelEditing}><Close width="30" height="30" /></Button>
                  <Button default onClick={addCondition}><Check width="20" height="20" /></Button>
                </Show>
              </div>
            </Show>
            <Show when={conditions()}>
              <div class="dc20-conditions">
                <For each={Object.entries(currentConditions())}>
                  {([slug, level]) =>
                    <div class="dc20-condition">
                      <div class="dc20-condition-data">
                        <p class="flex-1">{conditions()[slug].name}</p>
                        <Show when={conditions()[slug].value}>
                          <div class="flex ml-4">
                            <Button default size="small" classList="opacity-75" onClick={() => changeCondition(slug, -1)}>
                              <Minus />
                            </Button>
                            <p class="mx-2 w-6 text-center">{level}</p>
                            <Button default size="small" classList="opacity-75" onClick={() => changeCondition(slug, 1)}>
                              <Plus />
                            </Button>
                          </div>
                        </Show>
                        <Button default size="small" classList="ml-4 opacity-75" onClick={() => removeCondition(slug)}>
                          <Close />
                        </Button>
                      </div>
                      <p
                        class="feat-markdown text-xs mt-1"
                        innerHTML={conditions()[slug].description} // eslint-disable-line solid/no-innerhtml
                      />
                    </div>
                  }
                </For>
              </div>
            </Show>
          </div>
        </Toggle>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
