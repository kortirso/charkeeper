import { createSignal, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Key } from '@solid-primitives/keyed';

import { Input, Button, Select, TextArea } from '../../components';
import { useAppLocale } from '../../context';
import { translate } from '../../helpers';
import { Trash } from '../../assets';

const TRANSLATION = {
  en: {
    save: 'Save',
    cancel: 'Cancel',
    formTitle: 'Feature editing',
    title: 'Feature title',
    description: 'Feature description',
    kind: 'Feature kind',
    limit: 'Usage limit',
    limitRefresh: 'Limit refresh',
    addBonus: 'Add bonus',
    bonusModify: 'Modify',
    bonusType: 'Bonus type',
    bonusValue: 'Bonus value',
    mastery: 'Subclass mastery',
    domainLevel: 'Domain level',
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
    save: 'Сохранить',
    cancel: 'Отменить',
    formTitle: 'Редактирование способности',
    title: 'Название',
    description: 'Описание',
    kind: 'Тип',
    limit: 'Лимит использований',
    limitRefresh: 'Обновление лимита',
    addBonus: 'Добавить бонус',
    bonusModify: 'Прибавка к',
    bonusType: 'Тип бонуса',
    bonusValue: 'Значение бонуса',
    mastery: 'Мастерство подкласса',
    domainLevel: 'Уровень домена',
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

export const DaggerheartFeatForm = (props) => {
  const [featForm, setFeatForm] = createStore({
    title: '',
    description: '',
    origin: props.origin || '',
    origin_value: props.originValue || '',
    kind: 'static',
    limit: null,
    limit_refresh: null,
    subclass_mastery: 1,
    level: 1
  });
  const [bonuses, setBonuses] = createSignal([]);

  const [locale] = useAppLocale();

  // const daggerheartCharacters = createMemo(() => {
  //   if (props.characters === undefined) return [];

  //   return props.characters.filter((item) => item.provider === 'daggerheart').reduce((acc, item) => { acc[item.id] = item.name; return acc; }, {});
  // });

  // const originValues = createMemo(() => {
  //   if (featForm.origin === 'character') return daggerheartCharacters();
    
  //   return [];
  // });

  const addBonus = () => setBonuses(bonuses().concat({ id: Math.floor(Math.random() * 1000), type: 'static', modify: null, value: null }));

  const removeBonus = (bonus) => setBonuses(bonuses().filter((item) => item.id !== bonus.id));

  const updateBonus = (bonus, attribute, value) => {
    const newValue = bonuses().map((item) => {
      if (item.id !== bonus.id) return item;
      if (attribute === 'modify') return { ...item, [attribute]: value, type: 'static', value: null };

      return { ...item, [attribute]: value };
    });
    setBonuses(newValue);
  }

  const parseValue = (value) => parseInt(value || 0);

  const save = () => {
    const presentedBonuses = bonuses().map((item) => {
      const result = { id: item.id, type: item.type };
      const value = item.type === 'static' ? parseValue(item.value) : item.value;

      if (TRAITS.includes(item.modify)) return { ...result, value: { traits: { [item.modify]: value } } };
      if (THRESHOLDS.includes(item.modify)) return { ...result, value: { thresholds: { [item.modify]: value } } };
      return { ...result, value: { [item.modify]: value } };
    });

    props.onSave({
      brewery: Object.fromEntries(Object.entries(featForm).filter(([, value]) => value !== null)),
      bonuses: presentedBonuses
    });
  }

  return (
    <>
      <p class="mb-2 text-xl">{TRANSLATION[locale()]['formTitle']}</p>
      <Input
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['title']}
        value={featForm.title}
        onInput={(value) => setFeatForm({ ...featForm, title: value })}
      />
      <TextArea
        rows="5"
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['description']}
        value={featForm.description}
        onChange={(value) => setFeatForm({ ...featForm, description: value })}
      />
      <Show when={featForm.origin === 'subclass'}>
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].mastery}
          items={{ 1: 'Foundation', 2: 'Specialization', 3: 'Mastery' }}
          selectedValue={featForm.subclass_mastery}
          onSelect={(value) => setFeatForm({ ...featForm, subclass_mastery: value })}
        />
      </Show>
      <Show when={featForm.origin === 'domain_card'}>
        <Input
          numeric
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()].domainLevel}
          value={featForm.level}
          onInput={(value) => setFeatForm({ ...featForm, level: parseInt(value) })}
        />
      </Show>
      <Select
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['kind']}
        items={translate({ "static": { "name": { "en": "Static text", "ru": "Вывод описания" } }, "text": { "name": { "en": "Text area", "ru": "С вводом данных" } } }, locale())}
        selectedValue={featForm.kind}
        onSelect={(value) => setFeatForm({ ...featForm, kind: value })}
      />
      <Button default small classList="p-1 mb-2" onClick={addBonus}>{TRANSLATION[locale()]['addBonus']}</Button>
      <Show when={bonuses().length > 0}>
        <Key each={bonuses()} by={item => item.id}>
          {(bonus) =>
            <>
              <div class="flex gap-x-2 items-center">
                <Select
                  containerClassList="mb-2 flex-1"
                  labelText={TRANSLATION[locale()]['bonusModify']}
                  items={TRANSLATION[locale()]['modifies']}
                  selectedValue={bonus().modify}
                  onSelect={(value) => updateBonus(bonus(), 'modify', value)}
                />
                <Button default classList="px-2 py-1" onClick={() => removeBonus(bonus())}>
                  <Trash width="24" height="24" />
                </Button>
              </div>
              <Show when={bonus().modify !== null}>
                <div class="flex gap-x-2">
                  <Select
                    containerClassList="mb-2 flex-1"
                    labelText={TRANSLATION[locale()]['bonusType']}
                    items={translate({ "static": { "name": { "en": "Static", "ru": "Статичный" } }, "dynamic": { "name": { "en": "Dynamic", "ru": "Динамический" } } }, locale())}
                    selectedValue={bonus().type}
                    onSelect={(value) => updateBonus(bonus(), 'type', value)}
                  />
                  <Show
                    when={bonus().type === 'static' || bonus().modify === 'proficiency'}
                    fallback={
                      <Select
                        containerClassList="mb-2 flex-1"
                        labelText={TRANSLATION[locale()]['bonusValue']}
                        items={translate({ "proficiency": { "name": { "en": "Proficiency", "ru": "Мастерство" } }, "level": { "name": { "en": "Level", "ru": "Уровень" } }, "tier": { "name": { "en": "Tier", "ru": "Ранг" } } }, locale())}
                        selectedValue={bonus().value}
                        onSelect={(value) => updateBonus(bonus(), 'value', value)}
                      />
                    }
                  >
                    <Input
                      nemeric
                      containerClassList="mb-2 flex-1"
                      labelText={TRANSLATION[locale()]['bonusValue']}
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
      <Show when={featForm.limit}>
        <Select
          containerClassList="mb-2"
          labelText={TRANSLATION[locale()]['limitRefresh']}
          items={translate({ "short_rest": { "name": { "en": "Short rest", "ru": "Короткий отдых" } }, "long_rest": { "name": { "en": "Long rest", "ru": "Продолжительный отдых" } }, "session": { "name": { "en": "Session", "ru": "После сессии" } } }, locale())}
          selectedValue={featForm.limit_refresh}
          onSelect={(value) => setFeatForm({ ...featForm, limit_refresh: value })}
        />
      </Show>
      <Input
        nemeric
        containerClassList="mb-2"
        labelText={TRANSLATION[locale()]['limit']}
        value={featForm.limit}
        onInput={(value) => setFeatForm({ ...featForm, limit: value })}
      />
      <div class="flex justify-end gap-4 mt-4">
        <Button default classList="py-1 px-2" onClick={props.onCancel}>{TRANSLATION[locale()]['cancel']}</Button>
        <Button default classList="py-1 px-2" onClick={save}>{TRANSLATION[locale()]['save']}</Button>
      </div>
    </>
  );
}
