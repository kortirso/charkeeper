import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Input, Button, Select, TextArea, Checkbox, ModifiersForm } from '../../../components';
import { useAppLocale } from '../../../context';
import { Trash } from '../../../assets';
import { translate } from '../../../helpers';

const TRANSLATION = {
  en: {
    markdown: 'You can use Markdown for editing description',
    save: 'Save',
    cancel: 'Cancel',
    formTitle: 'Feature editing',
    title: 'Feature title',
    description: 'Feature description',
    kind: 'Feature kind',
    limit: 'Usage limit',
    limitRefresh: 'Limit refresh',
    level: 'Level',
    continious: 'Activateable',
    staticSpells: 'Static spells',
    addSpell: 'Add spell',
    spells: 'Spells',
    spellAbilities: {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma'
    },
    spellAbility: 'Ability'
  },
  ru: {
    markdown: 'Вы можете использовать Markdown для редактирования описания',
    save: 'Сохранить',
    cancel: 'Отменить',
    formTitle: 'Редактирование способности',
    title: 'Название',
    description: 'Описание',
    kind: 'Тип',
    limit: 'Лимит использований',
    limitRefresh: 'Обновление лимита',
    level: 'Уровень',
    continious: 'Включаемое',
    staticSpells: 'Врождённые заклинания',
    addSpell: 'Добавить заклинание',
    spells: 'Заклинания',
    spellAbilities: {
      str: 'Сила',
      dex: 'Ловкость',
      con: 'Телосложение',
      int: 'Интеллект',
      wis: 'Мудрость',
      cha: 'Харизма'
    },
    spellAbility: 'Характеристика'
  }
}

const MAPPING = {
  en: {
    'str': 'Strength',
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'save_dc.str': 'Strength saving throw',
    'save_dc.dex': 'Dexterity saving throw',
    'save_dc.con': 'Constitution saving throw',
    'save_dc.int': 'Intelligence saving throw',
    'save_dc.wis': 'Wisdom saving throw',
    'save_dc.cha': 'Charisma saving throw',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'speeds.swim': 'Swim speed',
    'speeds.flight': 'Flight speed',
    'speeds.climb': 'Climb speed',
    'attack': 'Attack',
    'unarmed_attacks': 'Unarmed attacks',
    'melee_attacks': 'Melee attacks',
    'thrown_attacks': 'Thrown attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'unarmed_damage': 'Unarmed damage',
    'melee_damage': 'Melee damage',
    'thrown_damage': 'Thrown damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'save_dc.str': 'Сила спасбросок',
    'save_dc.dex': 'Ловкость спасбросок',
    'save_dc.con': 'Телосложение спасбросок',
    'save_dc.int': 'Интеллект спасбросок',
    'save_dc.wis': 'Мудрость спасбросок',
    'save_dc.cha': 'Харизма спасбросок',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'speeds.swim': 'Скорость плавания',
    'speeds.flight': 'Скорость полёта',
    'speeds.climb': 'Скорость лазания',
    'attack': 'Атака',
    'unarmed_attacks': 'Безоружные атаки',
    'melee_attacks': 'Рукопашные атаки',
    'thrown_attacks': 'Метательные атаки',
    'range_attacks': 'Дистанционные атаки',
    'damage': 'Урон',
    'unarmed_damage': 'Безоружный урон',
    'melee_damage': 'Рукопашный урон',
    'thrown_damage': 'Метательный урон',
    'range_damage': 'Дистанционный урон'
  }
}

const ONLY_ADD = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'attack', 'damage'];

const VARIABLES = {
  en: {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma',
    level: 'Level',
    proficiency_bonus: 'Proficiency bonus',
    no_body_armor: 'No body armor',
    no_armor: 'No armor'
  },
  ru: {
    str: 'Сила',
    dex: 'Ловкость',
    con: 'Телосложение',
    int: 'Интеллект',
    wis: 'Мудрость',
    cha: 'Харизма',
    level: 'Уровень',
    proficiency_bonus: 'Бонус мастерства',
    no_body_armor: 'Без доспеха',
    no_armor: 'Без брони'
  }
}

export const DndFeatForm = (props) => {
  const [featForm, setFeatForm] = createStore({
    title: '',
    description: '',
    origin: props.origin || '',
    origin_value: props.originValue || '',
    kind: 'static',
    limit: null,
    limit_refresh: null,
    level: 1,
    modifiers: {},
    continious: false,
    static_spells: {},
  });

  const [featureId, setFeatureId] = createSignal(undefined);
  const [spellSlug, setSpellSlug] = createSignal(null);
  const [spellAbility, setSpellAbility] = createSignal(null);

  const [locale] = useAppLocale();

  createEffect(() => {
    if (props.feature && featureId() !== props.feature) {
      batch(() => {
        setFeatForm({
          ...props.feature,
          title: props.feature.title.en,
          description: props.feature.description.en,
          static_spells: props.feature.info.static_spells
        });
        setFeatureId(props.feature.id)
      });
    }
  });

  const addSpell = () => {
    if (!spellSlug()) return;
    if (!spellAbility()) return;

    batch(() => {
      setFeatForm({ ...featForm, static_spells: { ...featForm.static_spells, [spellSlug()]: { modifier: spellAbility() } } });
      setSpellSlug(null);
      setSpellAbility(null);
    });
  }

  const removeSpell = (slug) => {
    const { [slug]: removedProp, ...remainingObject } = featForm.static_spells; // eslint-disable-line no-unused-vars
    setFeatForm({ ...featForm, static_spells: remainingObject });
  }

  const changeModifiers = (payload) => setFeatForm({ ...featForm, modifiers: payload });

  const save = () => {
    props.onSave({
      brewery: Object.fromEntries(Object.entries(featForm).filter(([, value]) => value !== null))
    });
  }

  return (
    <div class="w-5xl">
      <p class="text-xl">{TRANSLATION[locale()].formTitle}</p>
      <Input
        containerClassList="mt-2"
        labelText={TRANSLATION[locale()].title}
        value={featForm.title}
        onInput={(value) => setFeatForm({ ...featForm, title: value })}
      />
      <div class="flex gap-4 mt-2">
        <Input
          numeric
          containerClassList="flex-1"
          labelText={TRANSLATION[locale()].level}
          value={featForm.level}
          onInput={(value) => setFeatForm({ ...featForm, level: parseInt(value) })}
        />
        <Select
          containerClassList="flex-1"
          labelText={TRANSLATION[locale()].kind}
          items={translate({ "static": { "name": { "en": "Static text", "ru": "Простое описание" } }, "text": { "name": { "en": "Text area", "ru": "С вводом данных" } }, "update_result": { "name": { "en": "Update result", "ru": "Второстепенное" } }, "hidden": { "name": { "en": "Hidden", "ru": "Не отображается" } } }, locale())}
          selectedValue={featForm.kind}
          onSelect={(value) => setFeatForm({ ...featForm, kind: value })}
        />
      </div>
      <ModifiersForm
        modifiers={props.feature ? props.feature.modifiers : {}}
        mapping={MAPPING[locale()]}
        onlyAdd={ONLY_ADD}
        variables={VARIABLES[locale()]}
        onChange={changeModifiers}
      />
      <div class="flex gap-4 mt-4">
        <Input
          nemeric
          containerClassList="flex-1"
          labelText={TRANSLATION[locale()].limit}
          value={featForm.limit}
          onInput={(value) => setFeatForm({ ...featForm, limit: value })}
        />
        <Show when={featForm.limit}>
          <Select
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].limitRefresh}
            items={translate({ "short_rest": { "name": { "en": "Short rest", "ru": "Короткий отдых" } }, "long_rest": { "name": { "en": "Long rest", "ru": "Продолжительный отдых" } }, "one_at_short_rest": { "name": { "en": "One at short rest", "ru": "Один при коротком отдыхе" } } }, locale())}
            selectedValue={featForm.limit_refresh}
            onSelect={(value) => setFeatForm({ ...featForm, limit_refresh: value })}
          />
        </Show>
      </div>
      <p class="mt-4">{TRANSLATION[locale()].staticSpells}</p>
      <Show when={props.spells}>
        <Show when={featForm.static_spells}>
          <For each={Object.entries(featForm.static_spells)}>
            {([slug, value]) =>
              <div class="flex items-end gap-4 mt-1">
                <p>{props.spells[slug]}</p>
                <p>{TRANSLATION[locale()].spellAbilities[value.modifier]}</p>
                <Button default classList="px-2 py-1" onClick={() => removeSpell(slug)}>
                  <Trash width="24" height="24" />
                </Button>
              </div>
            }
          </For>
        </Show>
        <div class="flex items-end gap-4 mt-2">
          <Select
            searchable
            containerClassList="flex-1"
            labelText={TRANSLATION[locale()].spells}
            items={props.spells}
            selectedValue={spellSlug()}
            onSelect={setSpellSlug}
          />
          <Select
            containerClassList="w-60"
            labelText={TRANSLATION[locale()].spellAbility}
            items={TRANSLATION[locale()].spellAbilities}
            selectedValue={spellAbility()}
            onSelect={setSpellAbility}
          />
          <Button default small classList="p-1 mt-2" onClick={addSpell}>{TRANSLATION[locale()].addSpell}</Button>
        </div>
      </Show>
      <TextArea
        rows="5"
        containerClassList="mt-2"
        labelText={TRANSLATION[locale()].description}
        value={featForm.description}
        onChange={(value) => setFeatForm({ ...featForm, description: value })}
      />
      <p class="mt-1 text-xs">{TRANSLATION[locale()].markdown}</p>
      <Checkbox
        labelText={TRANSLATION[locale()].continious}
        labelPosition="right"
        labelClassList="ml-2"
        checked={featForm.continious}
        classList="mt-4"
        onToggle={() => setFeatForm({ ...featForm, continious: !featForm.continious })}
      />
      <div class="flex justify-end gap-4 mt-4">
        <Button default classList="py-1 px-2" onClick={props.onCancel}>{TRANSLATION[locale()].cancel}</Button>
        <Button default classList="py-1 px-2" onClick={save}>{TRANSLATION[locale()].save}</Button>
      </div>
    </div>
  );
}
