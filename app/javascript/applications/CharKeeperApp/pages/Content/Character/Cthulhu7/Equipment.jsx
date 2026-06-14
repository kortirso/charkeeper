import { createSignal, createEffect, Show, batch } from 'solid-js';

import { ErrorWrapper, Input, Select, Button, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCthulhuItemRequest } from '../../../../requests/createCthulhuItemRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Adding item',
    name: 'Name',
    kind: 'Kind',
    kinds: {
      item: 'Item',
      weapon: 'Weapon'
    },
    add: 'Add item',
    back: 'Back',
    isAdded: 'Item is added',
    skill: 'Skill',
    damage: 'Damage',
    distance: 'Distance',
    attacks: 'Attacks',
    bonus: 'Damage bonus'
  },
  ru: {
    title: 'Добавление предмета',
    name: 'Название',
    kind: 'Тип',
    kinds: {
      item: 'Предмет',
      weapon: 'Оружие'
    },
    add: 'Сохранить',
    back: 'Назад',
    isAdded: 'Предмет добавлен',
    skill: 'Навык',
    damage: 'Урон',
    distance: 'Дистанция',
    attacks: 'Атаки',
    bonus: 'Бонус к урону'
  },
  es: {
    title: 'Adding item',
    name: 'Name',
    kind: 'Kind',
    kinds: {
      item: 'Item',
      weapon: 'Weapon'
    },
    add: 'Add item',
    back: 'Back',
    isAdded: 'Item is added',
    skill: 'Skill',
    damage: 'Damage',
    distance: 'Distance',
    attacks: 'Attacks',
    bonus: 'Damage bonus'
  }
}

export const Cthulhu7Equipment = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [form, setForm] = createSignal({ name: '', kind: 'item' });
  const [data, setData] = createSignal({ skill: null, damage: '', with_damage_bonus: false, distance: '', attacks: '1' });

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
  });

  const addItem = async () => {
    const payload = form().kind === 'item' ? form() : { ...form(), info: data() };
    const result = await createCthulhuItemRequest(appState.accessToken, character().id, { item: payload });
    if (result.errors_list === undefined) {
      batch(() => {
        setForm({ name: '', kind: 'item' });
        setData({ skill: null, damage: '', with_damage_bonus: false, distance: '', attacks: '1' });
      });
      renderNotice(localize(TRANSLATION, locale()).isAdded);
      if (form().kind === 'weapon') props.onReloadCharacter();
      props.reloadCharacterItems();
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Equipment' }}>
      <div class="blockable blockable-padding">
        <h2 class="text-lg mb-2">{localize(TRANSLATION, locale()).title}</h2>
        <div class="flex flex-col gap-2">
          <Input
            labelText={localize(TRANSLATION, locale()).name}
            value={form().name}
            onInput={(value) => setForm({ ...form(), name: value })}
          />
          <Select
            labelText={localize(TRANSLATION, locale()).kind}
            items={localize(TRANSLATION, locale()).kinds}
            selectedValue={form().kind}
            onSelect={(value) => setForm({ ...form(), kind: value })}
          />
          <Show when={form().kind === 'weapon'}>
            <div class="grid grid-cols-2 gap-2">
              <Select
                labelText={localize(TRANSLATION, locale()).skill}
                items={character().skills.sort((a, b) => a.name > b.name).reduce((acc, value) => { acc[value.slug] = value.name; return acc; }, {})}
                selectedValue={data().skill}
                onSelect={(value) => setData({ ...data(), skill: value })}
              />
              <Input
                placeholder="1d10"
                labelText={localize(TRANSLATION, locale()).damage}
                value={data().damage}
                onInput={(value) => setData({ ...data(), damage: value })}
              />
              <Input
                placeholder="50 m"
                labelText={localize(TRANSLATION, locale()).distance}
                value={data().distance}
                onInput={(value) => setData({ ...data(), distance: value })}
              />
              <Input
                labelText={localize(TRANSLATION, locale()).attacks}
                value={data().attacks}
                onInput={(value) => setData({ ...data(), attacks: value })}
              />
              <Checkbox
                labelText={localize(TRANSLATION, locale()).bonus}
                labelPosition="right"
                labelClassList="ml-2"
                checked={data().with_damage_bonus}
                onToggle={() => setData({ ...data(), with_damage_bonus: !data().with_damage_bonus })}
              />
            </div>
          </Show>
          <Button default textable onClick={addItem}>{localize(TRANSLATION, locale()).add}</Button>
        </div>
      </div>
      <Button default textable classList="mt-4" onClick={props.onBack}>{localize(TRANSLATION, locale()).back}</Button>
    </ErrorWrapper>
  );
}
