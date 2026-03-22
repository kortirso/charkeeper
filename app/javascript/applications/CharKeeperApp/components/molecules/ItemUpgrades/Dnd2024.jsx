import { createEffect, createSignal, Show, batch } from 'solid-js';

import { Input, Select, Button } from '../../../components';
import { useAppLocale, useAppState, useAppAlert } from '../../../context';
import { fetchCharacterBonusesRequest } from '../../../requests/fetchCharacterBonusesRequest';
import { createUpgradeRequest } from '../../../requests/createUpgradeRequest';
import { localize, performResponse } from '../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Upgrading item',
    name: 'New item name',
    upgradeItem: 'Upgrade item',
    selectBonus: 'Select bonus from character list',
    warning: 'Character bonus will be deactivated'
  },
  ru: {
    title: 'Улучшение предмета',
    name: 'Новое название предмета',
    upgradeItem: 'Улучшить предмет',
    selectBonus: 'Выберите бонус из списка персонажа',
    warning: 'Бонус персонажа будет выключен'
  },
  es: {
    title: 'Mejorando el objeto',
    name: 'Nuevo nombre del objeto',
    upgradeItem: 'Mejorar objeto',
    selectBonus: 'Select bonus from character list',
    warning: 'Character bonus will be deactivated'
  }
}

export const Dnd2024ItemUpgrade = (props) => {
  const item = () => props.item;
  const state = () => props.state;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [bonuses, setBonuses] = createSignal(undefined);

  const [name, setName] = createSignal(item().name);
  const [bonusId, setBonusId] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const fetchBonuses = async () => await fetchCharacterBonusesRequest(appState.accessToken, 'dnd2024', props.characterId);

  createEffect(() => {
    if (lastActiveCharacterId() === props.characterId) return;

    Promise.all([fetchBonuses()]).then(
      ([bonusesData]) => {
        setBonuses(bonusesData.bonuses);
      }
    );

    setLastActiveCharacterId(props.characterId);
  });

  const upgradeItem = async () => {
    if (!bonusId()) return;

    const result = await createUpgradeRequest(
      appState.accessToken, 'dnd2024', props.characterId, item().id, {
        upgrade: { state: state(), name: name(), bonus_id: bonusId() }
      }
    )
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          setName('');
          setBonusId(null);
        });
        props.completeUpgrade(null);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <div class="max-w-md">
      <h2 class="text-lg">{localize(TRANSLATION, locale()).title}</h2>
      <Input
        containerClassList="mt-2"
        labelText={localize(TRANSLATION, locale()).name}
        value={name()}
        onInput={setName}
      />
      <Show when={bonuses()}>
        <Select
          containerClassList="mt-2"
          labelText={localize(TRANSLATION, locale()).selectBonus}
          items={Object.fromEntries(bonuses().map((item) => [item.id, item.comment]))}
          selectedValue={bonusId()}
          onSelect={setBonusId}
        />
        <div class="warning mt-2">
          <p class="text-black text-sm">{localize(TRANSLATION, locale()).warning}</p>
        </div>
      </Show>
      <Button default textable classList="mt-4" onClick={upgradeItem}>{localize(TRANSLATION, locale()).upgradeItem}</Button>
    </div>
  );
}
