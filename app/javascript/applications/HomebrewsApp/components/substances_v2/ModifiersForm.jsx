import { createEffect, createSignal, Show } from 'solid-js';
import { Entries } from '@solid-primitives/keyed';

import { Input, Button, Select } from '../../components';
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
    allowedVariables: 'Доступные формулы'
  }
}

export const ModifiersForm = (props) => {
  const [modifiers, setModifiers] = createSignal({});

  const [locale] = useAppLocale();

  createEffect(() => {
    setModifiers(props.modifiers);
  });

  const addModifier = () => updateModifiers({ ...modifiers(), unknown: { type: 'add', value: '' } });

  const removeModifier = (keyToRemove) => {
    const { [keyToRemove]: _removedProp, ...remainingObject } = modifiers(); // eslint-disable-line no-unused-vars
    updateModifiers(remainingObject);
  }

  const changeModifierKey = (currentKey, newKey) => {
    if (Object.keys(modifiers()).includes(newKey)) return;

    const { [currentKey]: removedProp, ...remainingObject } = modifiers(); // eslint-disable-line no-unused-vars
    updateModifiers({ ...remainingObject, [newKey]: { type: 'add', value: '' } });
  }

  const changeModifierType = (key, value) => {
    updateModifiers({ ...modifiers(), [key]: { type: value, value: modifiers()[key].value } });
  }

  const changeModifierValue = (key, value) => {
    updateModifiers({ ...modifiers(), [key]: { type: modifiers()[key].type, value: value } });
  }

  const updateModifiers = (payload) => {
    setModifiers(payload);
    props.onChange(payload)
  }

  return (
    <>
      <p class="mt-4">{TRANSLATION[locale()].title}</p>
      <Button default small classList="p-1 mt-2" onClick={addModifier}>{TRANSLATION[locale()].addModifier}</Button>
      <Entries of={modifiers()}>
        {(key, values) =>
          <>
            <div class="flex items-end gap-4 mt-2">
              <Select
                containerClassList="flex-1"
                labelText={TRANSLATION[locale()].attribute}
                items={props.keys}
                selectedValue={key}
                onSelect={(item) => changeModifierKey(key, item)}
              />
              <Show when={key !== 'unknown'}>
                <Select
                  containerClassList="flex-1"
                  labelText={TRANSLATION[locale()].type}
                  items={props.allowedToSet.includes(key) ? { add: 'Add', set: 'Set' } : { add: 'Add' }}
                  selectedValue={values().type}
                  onSelect={(item) => changeModifierType(key, item)}
                />
                <Input
                  containerClassList="flex-1"
                  labelText={TRANSLATION[locale()].value}
                  value={values().value}
                  onInput={(item) => changeModifierValue(key, item)}
                />
              </Show>
              <Button default classList="px-2 py-1" onClick={() => removeModifier(key)}>
                <Trash width="24" height="24" />
              </Button>
            </div>
            <Show when={key !== 'unknown'}>
              <p class="mt-2 text-xs">{TRANSLATION[locale()].allowedVariables}: {props.selfExcluded.includes(key) ? Object.entries(props.variables).filter(([itemKey,]) => !props.selfExcluded.includes(itemKey)).map(([itemKey, value]) => `${itemKey} - ${value}`).join('; ') : Object.entries(props.variables).map(([itemKey, value]) => `${itemKey} - ${value}`).join('; ')}</p>
            </Show>
          </>
        }
      </Entries>
    </>
  );
}
