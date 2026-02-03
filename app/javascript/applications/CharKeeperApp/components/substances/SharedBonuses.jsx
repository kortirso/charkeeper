import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { Toggle, Button, IconButton, Select, Input, Checkbox } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close, Trash } from '../../assets';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { updateCharacterBonusRequest } from '../../requests/updateCharacterBonusRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';
import { translate, localize } from '../../helpers';

const TRANSLATION = {
  en: {
    cancel: 'Cancel',
    save: 'Save',
    newBonus: 'Add modificator',
    addBonus: 'Add bonus',
    bonusModify: "Modify's target",
    bonusType: "Modify's type",
    bonusValue: "Modify's value",
    newBonusComment: "Modificator's name",
    enabled: 'Modificator is active',
    disabled: 'Modificator is disabled',
    noValues: 'At least one modificator should be present'
  },
  ru: {
    cancel: 'Отменить',
    save: 'Сохранить',
    newBonus: 'Добавить модификатор',
    addBonus: 'Добавить изменение',
    bonusModify: 'Цель изменения',
    bonusType: 'Тип изменения',
    bonusValue: 'Значение изменения',
    newBonusComment: 'Название модификатора',
    enabled: 'Модификатор активен',
    disabled: 'Модификатор не активен',
    noValues: 'Необходимо указать хотя бы один модификатор со значением'
  }
}

export const SharedBonuses = (props) => {
  const BonusComponent = props.bonusComponent; // eslint-disable-line solid/reactivity

  const character = () => props.character;

  const [createMode, setCreateMode] = createSignal(false);

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [bonuses, setBonuses] = createSignal(undefined);
  const [bonusesList, setBonusesList] = createSignal([]);
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

  const activateCreateMode = () => {
    batch(() => {
      setCreateMode(true);
      if (bonusesList().length === 0) addNewBonus();
    });
  }

  const addNewBonus = () => {
    const newValue = bonusesList().concat({ id: Math.floor(Math.random() * 1000), type: 'static', modify: null, value: null });
    setBonusesList(newValue);
  }

  const removeNewBonus = (bonus) => {
    const newValue = bonusesList().filter((item) => item.id !== bonus.id)
    setBonusesList(newValue);
  }

  const updateNewBonus = (bonus, attribute, value) => {
    const newValue = bonusesList().map((item) => {
      if (item.id !== bonus.id) return item;
      if (attribute === 'modify') return { ...item, modify: value, type: 'static', value: null };
      if (attribute === 'type') return { ...item, type: value, value: null };

      return { ...item, [attribute]: value };
    });
    setBonusesList(newValue);
  }

  const saveBonus = async () => {
    const bonusesWithValues = bonusesList().filter((item) => item.modify && item.value);
    if (bonusesWithValues.length === 0) return renderAlert(localize(TRANSLATION, locale()).noValues);

    const result = await props.onSaveBonus(bonusesWithValues, bonusComment());

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
          <div class="p-4 flex-1 flex flex-col blockable">
            <Input labelText={localize(TRANSLATION, locale()).newBonusComment} value={bonusComment()} onInput={setBonusComment} />
            <Show when={bonusesList().length > 0}>
              <Key each={bonusesList()} by={item => item.id}>
                {(bonus) =>
                  <>
                    <div class="flex gap-x-2 items-end py-1 mt-2">
                      <Select
                        containerClassList="flex-1"
                        labelText={localize(TRANSLATION, locale()).bonusModify}
                        items={props.mapping}
                        selectedValue={bonus().modify}
                        onSelect={(value) => updateNewBonus(bonus(), 'modify', value)}
                      />
                      <Button default classList="px-2 py-1" onClick={() => removeNewBonus(bonus())}>
                        <Trash width="24" height="24" />
                      </Button>
                    </div>
                    <Show when={bonus().modify}>
                      <div class="flex gap-x-2 mt-2">
                        <Select
                          containerClassList="flex-1"
                          labelText={localize(TRANSLATION, locale()).bonusType}
                          items={translate(bonus().modify === props.proficiencyName ? { "static": { "name": { "en": "Static", "ru": "Статичный" } } } : { "static": { "name": { "en": "Static", "ru": "Статичный" } }, "dynamic": { "name": { "en": "Dynamic", "ru": "Динамический" } } }, locale())}
                          selectedValue={bonus().type}
                          onSelect={(value) => updateNewBonus(bonus(), 'type', value)}
                        />
                        <Show
                          when={bonus().type === 'static'}
                          fallback={
                            <Select
                              containerClassList="flex-1"
                              labelText={localize(TRANSLATION, locale()).bonusValue}
                              items={translate(props.dynamicItems, locale())}
                              selectedValue={bonus().value}
                              onSelect={(value) => updateNewBonus(bonus(), 'value', value)}
                            />
                          }
                        >
                          <Input
                            nemeric
                            containerClassList="flex-1"
                            labelText={localize(TRANSLATION, locale()).bonusValue}
                            value={bonus().value}
                            onInput={(value) => updateNewBonus(bonus(), 'value', value)}
                          />
                        </Show>
                      </div>
                    </Show>
                  </>
                }
              </Key>
            </Show>
            <Button default small classList="p-1 mt-2" onClick={addNewBonus}>{localize(TRANSLATION, locale()).addBonus}</Button>
            <div class="flex justify-end mt-4">
              <Button outlined textable size="small" classList="mr-4" onClick={cancelBonus}>{localize(TRANSLATION, locale()).cancel}</Button>
              <Button default textable size="small" onClick={saveBonus}>{localize(TRANSLATION, locale()).save}</Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="w-full uppercase" onClick={activateCreateMode}>
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
                  <BonusComponent bonus={bonus} />
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
