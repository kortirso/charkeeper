import { createEffect, createSignal, createMemo, Show, batch } from 'solid-js';
import { Entries } from '@solid-primitives/keyed';

import { Input, Button, Select, Label } from '../../components';
import { Trash } from '../../assets';
import { useAppLocale } from '../../context';

const TRANSLATION = {
  en: {
    title: 'Modifiers',
    addModifier: 'Add modifier',
    attribute: 'Attribute',
    type: 'Type',
    value: 'Value',
    allowedVariables: 'Allowed variables'
  },
  ru: {
    title: 'Модификаторы',
    addModifier: 'Добавить модификатор',
    attribute: 'Атрибут',
    type: 'Тип',
    value: 'Значение',
    allowedVariables: 'Доступные переменные'
  },
  es: {
    title: 'Modificadores',
    addModifier: 'Agregar modificador',
    attribute: 'Atributo',
    type: 'Tipo',
    value: 'Valor',
    allowedVariables: 'Variables permitidas'
  }
}

export const ModifiersForm = (props) => {
  const [bonusesList, setBonusesList] = createSignal({});
  const [newBonusMod, setNewBonusMod] = createSignal(null);

  const [locale] = useAppLocale();

  createEffect(() => {
    setBonusesList(props.modifiers);
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

  const changeModifierType = (key, value) => {
    updateModifiers({ ...bonusesList(), [key]: { type: value, value: bonusesList()[key].value } });
  }

  const changeModifierValue = (key, value) => {
    updateModifiers({ ...bonusesList(), [key]: { type: bonusesList()[key].type, value: value } });
  }

  const updateModifiers = (payload) => {
    setBonusesList(payload);
    props.onChange(payload)
  }

  return (
    <>
      <p class="mt-4">{TRANSLATION[locale()].title}</p>
      <Entries of={bonusesList()}>
        {(key, values) =>
          <>
            <Label
              labelText={`${TRANSLATION[locale()].value}: ${props.mapping[key]}`}
              labelClassList="mt-8 block!"
            />
            <div class="flex items-end gap-x-4 mt-1">
              <Select
                containerClassList="flex-1"
                labelText={TRANSLATION[locale()].type}
                items={props.onlyAdd.includes(key) ? { add: 'Add' } : { add: 'Add', set: 'Set' }}
                selectedValue={values().type}
                onSelect={(item) => changeModifierType(key, item)}
              />
              <Input
                containerClassList="flex-1"
                labelText={TRANSLATION[locale()].value}
                value={values().value}
                onInput={(item) => changeModifierValue(key, item)}
              />
              <Button default classList="px-2 py-1" onClick={() => removeNewBonus(key)}>
                <Trash width="24" height="24" />
              </Button>
            </div>
            <p class="mt-2 text-xs">{TRANSLATION[locale()].allowedVariables}: {Object.entries(props.variables).map(([itemKey, value]) => `${itemKey} - ${value}`).join('; ')}</p>
          </>
        }
      </Entries>
      <div class="flex items-end gap-x-4 mt-4">
        <Select
          containerClassList="flex-1"
          labelText={TRANSLATION[locale()].attribute}
          items={availableBonusMod()}
          selectedValue={newBonusMod()}
          onSelect={setNewBonusMod}
        />
        <Show when={newBonusMod()}>
          <Button default small classList="p-1 mt-2" onClick={addNewBonus}>{TRANSLATION[locale()].addModifier}</Button>
        </Show>
      </div>
    </>
  );
}
