import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { Toggle, Button, IconButton, Select, Input } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Close, Trash } from '../../assets';
import { fetchCharacterBonusesRequest } from '../../requests/fetchCharacterBonusesRequest';
import { removeCharacterBonusRequest } from '../../requests/removeCharacterBonusRequest';
import { translate } from '../../helpers';

const TRANSLATION = {
  en: {
    cancel: 'Cancel',
    save: 'Save',
    newBonus: 'Add modificators',
    addBonus: 'Add bonus',
    bonusModify: 'Modify',
    bonusType: 'Bonus type',
    bonusValue: 'Bonus value',
    newBonusComment: "Modificator's name"
  },
  ru: {
    cancel: 'Отменить',
    save: 'Сохранить',
    newBonus: 'Добавить модификаторы',
    addBonus: 'Добавить бонус',
    bonusModify: 'Прибавка к',
    bonusType: 'Тип бонуса',
    bonusValue: 'Значение бонуса',
    newBonusComment: 'Название модификатора'
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
  const [{ renderAlerts }] = useAppAlert();
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
      if (attribute === 'modify') return { ...item, [attribute]: value, type: 'static', value: null };

      return { ...item, [attribute]: value };
    });
    setBonusesList(newValue);
  }

  const saveBonus = async () => {
    const result = await props.onSaveBonus(bonusesList(), bonusComment());

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
            <Input labelText={TRANSLATION[locale()].newBonusComment} value={bonusComment()} onInput={setBonusComment} />
            <Show when={bonusesList().length > 0}>
              <Key each={bonusesList()} by={item => item.id}>
                {(bonus) =>
                  <>
                    <div class="flex gap-x-2 items-end py-1 mb-2">
                      <Select
                        containerClassList="flex-1"
                        labelText={TRANSLATION[locale()].bonusModify}
                        items={props.mapping}
                        selectedValue={bonus().modify}
                        onSelect={(value) => updateNewBonus(bonus(), 'modify', value)}
                      />
                      <Button default classList="px-2 py-1" onClick={() => removeNewBonus(bonus())}>
                        <Trash width="24" height="24" />
                      </Button>
                    </div>
                    <Show when={bonus().modify}>
                      <div class="flex gap-x-2">
                        <Select
                          containerClassList="mb-2 flex-1"
                          labelText={TRANSLATION[locale()].bonusType}
                          items={translate({ "static": { "name": { "en": "Static", "ru": "Статичный" } }, "dynamic": { "name": { "en": "Dynamic", "ru": "Динамический" } } }, locale())}
                          selectedValue={bonus().type}
                          onSelect={(value) => updateNewBonus(bonus(), 'type', value)}
                        />
                        <Show
                          when={bonus().type === 'static' || bonus().modify === props.proficiencyName}
                          fallback={
                            <Select
                              containerClassList="mb-2 flex-1"
                              labelText={TRANSLATION[locale()].bonusValue}
                              items={translate(props.dynamicItems, locale())}
                              selectedValue={bonus().value}
                              onSelect={(value) => updateNewBonus(bonus(), 'value', value)}
                            />
                          }
                        >
                          <Input
                            nemeric
                            containerClassList="mb-2 flex-1"
                            labelText={TRANSLATION[locale()].bonusValue}
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
            <Button default small classList="p-1 my-2" onClick={addNewBonus}>{TRANSLATION[locale()].addBonus}</Button>
            <div class="flex justify-end mt-2">
              <Button outlined textable size="small" classList="mr-4" onClick={cancelBonus}>{TRANSLATION[locale()].cancel}</Button>
              <Button default textable size="small" onClick={saveBonus}>{TRANSLATION[locale()].save}</Button>
            </div>
          </div>
        }
      >
        <Button default textable classList="mb-2 w-full uppercase" onClick={() => setCreateMode(true)}>
          {TRANSLATION[locale()].newBonus}
        </Button>
        <Show when={bonuses() !== undefined}>
          <For each={bonuses()}>
            {(bonus) =>
              <Toggle isOpenByParent title={
                <div class="flex items-center">
                  <p class="flex-1">{bonus.comment}</p>
                  <IconButton onClick={(e) => removeBonus(e, bonus.id)}>
                    <Close />
                  </IconButton>
                </div>
              }>
                <div class="flex flex-wrap gap-1">
                  <BonusComponent bonus={bonus} />
                </div>
              </Toggle>
            }
          </For>
        </Show>
      </Show>
    </>
  );
}
