import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';
import { Entries } from '@solid-primitives/keyed';

import { Toggle, Button, IconButton, Select, Input, Checkbox, Label } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close, Trash, PlusSmall } from '../../assets';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { updateCharacterBonusRequest } from '../../requests/updateCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';
import { translate, localize } from '../../helpers';

const TRANSLATION = {
  en: {
    cancel: 'Cancel',
    save: 'Save',
    newBonus: 'Add modificator',
    bonusModify: "Modify's target",
    bonusType: "Modify's type",
    bonusValue: "Modify's value",
    newBonusComment: "Modificator's name",
    enabled: 'Modificator is active',
    disabled: 'Modificator is disabled',
    noValues: 'At least one modificator should be present',
    allVariables: 'You can use all available variables for formula',
    limitedVariables: 'Variables are not available'
  },
  ru: {
    cancel: 'Отменить',
    save: 'Сохранить',
    newBonus: 'Добавить модификатор',
    bonusModify: 'Цель изменения',
    bonusType: 'Тип изменения',
    bonusValue: 'Значение изменения',
    newBonusComment: 'Название модификатора',
    enabled: 'Модификатор активен',
    disabled: 'Модификатор не активен',
    noValues: 'Необходимо указать хотя бы один модификатор со значением',
    allVariables: 'Можете использовать все переменные для формулы',
    limitedVariables: 'Использование переменных не доступно'
  },
  es: {
    cancel: 'Cancelar',
    save: 'Guardar',
    newBonus: 'Añadir modificador',
    bonusModify: 'Objetivo de la bonificación',
    bonusType: 'Tipo de bonificación',
    bonusValue: 'Valor de la bonificación',
    newBonusComment: 'Nombre del modificador',
    enabled: 'El modificador está activo',
    disabled: 'El modificador no está activo',
    noValues: 'Debe haber al menos un modificador',
    allVariables: 'You can use all available variables for formula',
    limitedVariables: 'Variables are not available'
  }
}

export const SharedBonusesV2 = (props) => {
  const character = () => props.character;

  const [createMode, setCreateMode] = createSignal(false);

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [bonuses, setBonuses] = createSignal(undefined);

  const [bonusesList, setBonusesList] = createSignal({});
  const [bonusComment, setBonusComment] = createSignal('');
  const [newBonusMod, setNewBonusMod] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchBonuses = async () => await fetchCharacterBonusesRequest(appState.accessToken, character().provider, character().id);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    Promise.all([fetchBonuses()]).then(
      ([bonusesData]) => {
        setBonuses(bonusesData.bonuses);
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const availableBonusMod = createMemo(() => {
    const activeKeys = Object.keys(bonusesList());

    return Object.fromEntries(Object.entries(props.mapping).filter(([slug,]) => !activeKeys.includes(slug)));
  });

  const addNewBonus = () => {
    if (!newBonusMod()) return;

    batch(() => {
      setBonusesList({ ...bonusesList(), [newBonusMod()]: { type: 'add', value: '' } });
      setNewBonusMod(null);
    });
  }

  const removeNewBonus = (keyToRemove) => {
    const { [keyToRemove]: _removedProp, ...remainingObject } = bonusesList(); // eslint-disable-line no-unused-vars
    setBonusesList(remainingObject);
  }

  const saveBonus = async () => {
    const bonusesWithValues = Object.entries(bonusesList()).filter(([, values]) => values.value.length > 0);
    if (bonusesWithValues.length === 0) return renderAlert(localize(TRANSLATION, locale()).noValues);

    const result = await props.onSaveBonus(Object.fromEntries(bonusesWithValues), bonusComment());

    if (result.errors_list === undefined) {
      batch(() => {
        setCreateMode(false);
        setBonusComment('');
        props.onReloadCharacter();
        setBonuses([result.bonus].concat(bonuses()))
      })
    } else renderAlerts(result.errors_list);
  }

  const cancelBonus = () => setCreateMode(false);

  const changeBonus = async (bonus) => {
    const result = await updateCharacterBonusRequest(appState.accessToken, character().provider, character().id, bonus.id, { bonus: { enabled: !bonus.enabled } });
    if (result.errors_list === undefined) {
      setBonuses(
        bonuses().map((item) => {
          if (item.id !== bonus.id) return item;

          return { ...item, enabled: !bonus.enabled };
        })
      )
      props.onReloadCharacter();
    }
  }

  const removeBonus = async (event, bonusId) => {
    event.stopPropagation();

    const result = await removeCharacterBonusRequest(appState.accessToken, character().provider, character().id, bonusId);
    if (result.errors_list === undefined) {
      setBonuses(bonuses().filter((item) => item.id !== bonusId))
      props.onReloadCharacter();
    }
  }

  return (
    <>
      <Show
        when={!createMode()}
        fallback={
          <>
            {props.warningComponent}
            <div class="py-4 px-2 md:px-4 blockable mt-2">
              <Input labelText={localize(TRANSLATION, locale()).newBonusComment} value={bonusComment()} onInput={setBonusComment} />
              <Show when={Object.keys(bonusesList()).length > 0}>
                <Entries of={bonusesList()}>
                  {(key, values) =>
                    <>
                      <Label
                        labelText={`${localize(TRANSLATION, locale()).bonusModify}: ${props.mapping[key]}`}
                        labelClassList="mt-8 block!"
                      />
                      <Show
                        when={props.noVariables.includes(key)}
                        fallback={<p class="text-sm mt-1">{localize(TRANSLATION, locale()).allVariables} - {props.variablesList.join(', ')}</p>}
                      >
                        <p class="text-sm mt-1">{localize(TRANSLATION, locale()).limitedVariables}</p>
                      </Show>
                      <div class="flex items-end gap-x-4 mt-1">
                        <Select
                          containerClassList="flex-1"
                          labelText={localize(TRANSLATION, locale()).bonusType}
                          items={translate(props.onlyAdd.includes(key) ? { "add": { "name": { "en": "Add", "ru": "Добавление" } } } : { "add": { "name": { "en": "Add", "ru": "Добавление" } }, "set": { "name": { "en": "Set", "ru": "Переопределение" } } }, locale())}
                          selectedValue={values().type}
                          onSelect={(value) => setBonusesList({ ...bonusesList(), [key]: { ...bonusesList()[key], type: value } })}
                        />
                        <Input
                          containerClassList="flex-1"
                          labelText={localize(TRANSLATION, locale()).bonusValue}
                          value={values().value}
                          onInput={(value) => setBonusesList({ ...bonusesList(), [key]: { ...bonusesList()[key], value: value } })}
                        />
                        <Button default classList="px-2 py-1" onClick={() => removeNewBonus(key)}>
                          <Trash width="24" height="24" />
                        </Button>
                      </div>
                    </>
                  }
                </Entries>
              </Show>
              <div class="flex items-end gap-x-4 mt-4">
                <Select
                  containerClassList="flex-1"
                  labelText={localize(TRANSLATION, locale()).bonusModify}
                  items={availableBonusMod()}
                  selectedValue={newBonusMod()}
                  onSelect={setNewBonusMod}
                />
                <Show when={newBonusMod()}>
                  <Button default small classList="p-1 mt-2" onClick={addNewBonus}>
                    <PlusSmall width="24" height="24" />
                  </Button>
                </Show>
              </div>
              <div class="flex justify-end mt-4">
                <Button outlined textable size="small" classList="mr-4" onClick={cancelBonus}>{localize(TRANSLATION, locale()).cancel}</Button>
                <Button default textable size="small" onClick={saveBonus}>{localize(TRANSLATION, locale()).save}</Button>
              </div>
            </div>
          </>
        }
      >
        <Button default textable classList="w-full uppercase" onClick={() => setCreateMode(true)}>
          {localize(TRANSLATION, locale()).newBonus}
        </Button>
        <Show when={bonuses() !== undefined}>
          <For each={bonuses()}>
            {(bonus) =>
              <Toggle isOpenByParent containerClassList="mt-2" title={
                <div class="flex items-center">
                  <p class="flex-1">{bonus.comment}</p>
                  <IconButton onClick={(e) => removeBonus(e, bonus.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <div class="flex flex-wrap gap-1 mb-2">
                  <For each={Object.entries(bonus.value)}>
                    {([bonusSlug, values]) =>
                      <p class="bonus">
                        {props.mapping[bonusSlug]} {values.value}
                      </p>
                    }
                  </For>
                </div>
                <Checkbox
                  labelText={bonus.enabled ? localize(TRANSLATION, locale()).enabled : localize(TRANSLATION, locale()).disabled}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={bonus.enabled}
                  onToggle={() => changeBonus(bonus)}
                />
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
