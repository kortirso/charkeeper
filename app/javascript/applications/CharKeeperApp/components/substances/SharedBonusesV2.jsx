import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';
import { Entries } from '@solid-primitives/keyed';

import { Toggle, Button, IconButton, Select, Input, Checkbox } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close, Trash, PlusSmall } from '../../assets';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { updateCharacterBonusRequest } from '../../requests/updateCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    cancel: 'Cancel',
    save: 'Save',
    newBonus: 'Add modificator',
    bonusModify: "Modify's target",
    bonusValue: "Modify's value",
    newBonusComment: "Modificator's name",
    enabled: 'Modificator is active',
    disabled: 'Modificator is disabled',
    noValues: 'At least one modificator should be present',
    allVariables: 'You can use all available variables for formula'
  },
  ru: {
    cancel: 'Отменить',
    save: 'Сохранить',
    newBonus: 'Добавить модификатор',
    bonusModify: 'Цель изменения',
    bonusValue: 'Значение изменения',
    newBonusComment: 'Название модификатора',
    enabled: 'Модификатор активен',
    disabled: 'Модификатор не активен',
    noValues: 'Необходимо указать хотя бы один модификатор со значением',
    allVariables: 'Можете использовать все переменные для формулы'
  },
  es: {
    cancel: 'Cancelar',
    save: 'Guardar',
    newBonus: 'Añadir modificador',
    bonusModify: 'Objetivo de la bonificación',
    bonusValue: 'Valor de la bonificación',
    newBonusComment: 'Nombre del modificador',
    enabled: 'El modificador está activo',
    disabled: 'El modificador no está activo',
    noValues: 'Debe haber al menos un modificador',
    allVariables: 'You can use all available variables for formula'
  }
}

export const SharedBonusesV2 = (props) => {
  const character = () => props.character;

  const [createMode, setCreateMode] = createSignal(false);

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [bonuses, setBonuses] = createSignal(undefined);

  const [bonusesList, setBonusesList] = createSignal({});
  const [bonusComment, setBonusComment] = createSignal('');

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

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const availableBonusMod = createMemo(() => {
    const activeKeys = Object.keys(bonusesList());

    return Object.entries(props.mapping).filter(([slug,]) => !activeKeys.includes(slug)).map((item) => item[0]);
  });

  const saveBonus = async () => {
    const bonusesWithValues = Object.entries(bonusesList()).filter(([, values]) => values.value.length > 0);
    if (bonusesWithValues.length === 0) return renderAlert(i18n().noValues);

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

  const addNewBonus = () => {
    setBonusesList({ ...bonusesList(), [availableBonusMod()[0]]: { type: 'add', value: '' } });
  }

  const removeNewBonus = (keyToRemove) => {
    const { [keyToRemove]: _removedProp, ...remainingObject } = bonusesList(); // eslint-disable-line no-unused-vars
    setBonusesList(remainingObject);
  }

  const changeKey = (key, value) => {
    if (availableBonusMod().includes(key)) return;

    const { [key]: _removedProp, ...remainingObject } = bonusesList(); // eslint-disable-line no-unused-vars
    setBonusesList({ ...remainingObject, [value]: { type: 'add', value: null } });
  }

  return (
    <>
      <Show
        when={!createMode()}
        fallback={
          <>
            {props.warningComponent}
            <div class="py-4 px-2 md:px-4 blockable mt-2 flex flex-col gap-y-4">
              <p class="text-sm">{i18n().allVariables} - {props.variablesList.join(', ')}</p>
              <div class="flex gap-4 items-end">
                <Input containerClassList="flex-1" labelText={i18n().newBonusComment} value={bonusComment()} onInput={setBonusComment} />
                <Button default small classList="p-1" onClick={addNewBonus}><PlusSmall width="24" height="24" /></Button>
              </div>
              <Show when={Object.keys(bonusesList()).length > 0}>
                <Entries of={bonusesList()}>
                  {(key, values) =>
                    <div class="flex items-end gap-x-4">
                      <Select
                        containerClassList="flex-1"
                        labelText={i18n().bonusModify}
                        items={props.mapping}
                        selectedValue={key}
                        onSelect={(value) => changeKey(key, value)}
                      />
                      <Input
                        containerClassList="flex-1"
                        labelText={i18n().bonusValue}
                        value={values().value}
                        onInput={(value) => setBonusesList({ ...bonusesList(), [key]: { ...bonusesList()[key], value: value } })}
                      />
                      <Button default classList="px-2 py-1" onClick={() => removeNewBonus(key)}>
                        <Trash width="24" height="24" />
                      </Button>
                    </div>
                  }
                </Entries>
              </Show>
              <div class="flex gap-4 justify-end">
                <Button outlined textable size="small" onClick={cancelBonus}><span>{i18n().cancel}</span></Button>
                <Button default textable size="small" onClick={saveBonus}><span>{i18n().save}</span></Button>
              </div>
            </div>
          </>
        }
      >
        <Button default textable classList="w-full uppercase" onClick={() => setCreateMode(true)}>
          <span>{i18n().newBonus}</span>
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
                  labelText={bonus.enabled ? i18n().enabled : i18n().disabled}
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
