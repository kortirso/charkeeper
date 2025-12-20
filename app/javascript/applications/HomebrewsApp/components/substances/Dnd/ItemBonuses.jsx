import { createEffect, createSignal, Show } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { Input, Button, Select, DndBonus } from '../../../components';
import { useAppLocale } from '../../../context';
import { translate } from '../../../helpers';
import { Trash } from '../../../assets';

const TRANSLATION = {
  en: {
    addBonus: 'Add bonus',
    bonusModify: 'Modify',
    bonusType: 'Bonus type',
    bonusValue: 'Bonus value',
    modifies: {
      'str': 'Strength',
      'dex': 'Dexterity',
      'con': 'Constitution',
      'int': 'Intelligence',
      'wis': 'Wisdom',
      'cha': 'Charisma',
      'armor_class': 'Armor Class',
      'initiative': 'Initiative',
      'speed': 'Speed',
      'attack': 'Attack',
      'proficiency': 'Proficiency bonus',
      'level': 'Level'
    }
  },
  ru: {
    addBonus: 'Добавить бонус',
    bonusModify: 'Прибавка к',
    bonusType: 'Тип бонуса',
    bonusValue: 'Значение бонуса',
    modifies: {
      'str': 'Сила',
      'dex': 'Ловкость',
      'con': 'Телосложение',
      'int': 'Интеллект',
      'wis': 'Мудрость',
      'cha': 'Харизма',
      'armor_class': 'Класс брони',
      'initiative': 'Инициатива',
      'speed': 'Скорость',
      'attack': 'Атака',
      'proficiency': 'Бонус мастерства',
      'level': 'Уровень'
    }
  }
}
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const DndItemBonuses = (props) => {
  const initialBonuses = () => props.bonuses;

  const [bonuses, setBonuses] = createSignal(initialBonuses());

  const [locale] = useAppLocale();

  createEffect(() => {
    setBonuses(initialBonuses());
  });

  const parseValue = (value) => parseInt(value || 0);

  const representBonuses = (newValue) => {
    setBonuses(newValue);
    const presentedBonuses = newValue.map((item) => {
      if (!item.fresh) return item

      const result = { id: item.id, type: item.type };
      const value = item.type === 'static' ? parseValue(item.value) : item.value;

      if (ABILITIES.includes(item.modify)) return { ...result, value: { abilities: { [item.modify]: value } } };
      return { ...result, value: { [item.modify]: value } };
    });
    props.onBonus(presentedBonuses);
  }

  const addBonus = () => {
    const newValue = bonuses().concat({ id: Math.floor(Math.random() * 1000), type: 'static', modify: null, value: null, fresh: true });
    representBonuses(newValue);
  }

  const removeBonus = (bonus) => {
    const newValue = bonuses().filter((item) => item.id !== bonus.id)
    representBonuses(newValue);
  }

  const updateBonus = (bonus, attribute, value) => {
    const newValue = bonuses().map((item) => {
      if (item.id !== bonus.id) return item;
      if (attribute === 'modify') return { ...item, [attribute]: value, type: 'static', value: null };

      return { ...item, [attribute]: value };
    });
    representBonuses(newValue);
  }

  return (
    <>
      <Button default small classList="p-1 my-2" onClick={addBonus}>{TRANSLATION[locale()].addBonus}</Button>
      <Show when={bonuses().length > 0}>
        <Key each={bonuses()} by={item => item.id}>
          {(bonus) =>
            <>
              <div class="flex gap-x-2 items-center py-1">
                <Show
                  when={bonus().fresh}
                  fallback={
                    <DndBonus bonus={bonus()} />
                  }
                >
                  <Select
                    containerClassList="mb-2 flex-1"
                    labelText={TRANSLATION[locale()].bonusModify}
                    items={TRANSLATION[locale()].modifies}
                    selectedValue={bonus().modify}
                    onSelect={(value) => updateBonus(bonus(), 'modify', value)}
                  />
                </Show>
                <Button default classList="px-2 py-1" onClick={() => removeBonus(bonus())}>
                  <Trash width="24" height="24" />
                </Button>
              </div>
              <Show when={bonus().fresh && bonus().modify !== null}>
                <div class="flex gap-x-2">
                  <Select
                    containerClassList="mb-2 flex-1"
                    labelText={TRANSLATION[locale()].bonusType}
                    items={translate({ "static": { "name": { "en": "Static", "ru": "Статичный" } }, "dynamic": { "name": { "en": "Dynamic", "ru": "Динамический" } } }, locale())}
                    selectedValue={bonus().type}
                    onSelect={(value) => updateBonus(bonus(), 'type', value)}
                  />
                  <Show
                    when={bonus().type === 'static' || bonus().modify === 'proficiency'}
                    fallback={
                      <Select
                        containerClassList="mb-2 flex-1"
                        labelText={TRANSLATION[locale()].bonusValue}
                        items={translate({ "proficiency": { "name": { "en": "Proficiency", "ru": "Мастерство" } }, "level": { "name": { "en": "Level", "ru": "Уровень" } } }, locale())}
                        selectedValue={bonus().value}
                        onSelect={(value) => updateBonus(bonus(), 'value', value)}
                      />
                    }
                  >
                    <Input
                      nemeric
                      containerClassList="mb-2 flex-1"
                      labelText={TRANSLATION[locale()].bonusValue}
                      value={bonus().value}
                      onInput={(value) => updateBonus(bonus(), 'value', value)}
                    />
                  </Show>
                </div>
              </Show>
            </>
          }
        </Key>
      </Show>
    </>
  );
}
