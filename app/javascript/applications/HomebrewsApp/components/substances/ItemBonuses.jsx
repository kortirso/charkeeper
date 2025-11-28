import { createEffect, createSignal, Show } from 'solid-js';
import { Key } from '@solid-primitives/keyed';

import { Input, Button, Select, Bonus } from '../../components';
import { useAppLocale } from '../../context';
import { translate } from '../../helpers';
import { Trash } from '../../assets';

const TRANSLATION = {
  en: {
    addBonus: 'Add bonus',
    bonusModify: 'Modify',
    bonusType: 'Bonus type',
    bonusValue: 'Bonus value',
    modifies: {
      'str': 'Strength',
      'agi': 'Agility',
      'fin': 'Finesse',
      'ins': 'Instinct',
      'pre': 'Presence',
      'know': 'Knowledge',
      'health': 'Health',
      'stress': 'Stress',
      'hope': 'Hope',
      'evasion': 'Evasion',
      'armor_score': 'Armor score',
      'major': 'Major threshold',
      'severe': 'Severe threshold',
      'attack': 'Attacks',
      'proficiency': 'Proficiency'
    }
  },
  ru: {
    addBonus: 'Добавить бонус',
    bonusModify: 'Прибавка к',
    bonusType: 'Тип бонуса',
    bonusValue: 'Значение бонуса',
    modifies: {
      'str': 'Сила',
      'agi': 'Проворность',
      'fin': 'Искусность',
      'ins': 'Инстинкт',
      'pre': 'Влияние',
      'know': 'Знание',
      'health': 'Здоровье',
      'stress': 'Стресс',
      'hope': 'Надежда',
      'evasion': 'Уклонение',
      'armor_score': 'Слоты Доспеха',
      'major': 'Ощутимый урон',
      'severe': 'Тяжёлый урон',
      'attack': 'Атаки',
      'proficiency': 'Мастерство'
    }
  }
}
const TRAITS = ['str', 'agi', 'fin', 'ins', 'pre', 'know'];
const THRESHOLDS = ['major', 'severe'];

export const ItemBonuses = (props) => {
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

      if (TRAITS.includes(item.modify)) return { ...result, value: { traits: { [item.modify]: value } } };
      if (THRESHOLDS.includes(item.modify)) return { ...result, value: { thresholds: { [item.modify]: value } } };
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
                    <Bonus bonus={bonus()} />
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
                        items={translate({ "proficiency": { "name": { "en": "Proficiency", "ru": "Мастерство" } }, "level": { "name": { "en": "Level", "ru": "Уровень" } }, "tier": { "name": { "en": "Tier", "ru": "Ранг" } } }, locale())}
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
