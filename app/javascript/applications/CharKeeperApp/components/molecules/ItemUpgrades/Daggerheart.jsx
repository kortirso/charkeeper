import { createSignal, createMemo, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Input, Select, Button } from '../../../components';
import config from '../../../data/daggerheart.json';
import { useAppLocale, useAppState, useAppAlert } from '../../../context';
import { createUpgradeRequest } from '../../../requests/createUpgradeRequest';
import { localize, performResponse } from '../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Upgrading item',
    name: 'New item name',
    types: {
      charm: 'Charm',
      stone: 'Stone',
      gem: 'Gem',
      armor_stone: 'Stone'
    },
    upgradeItem: 'Upgrade item'
  },
  ru: {
    title: 'Улучшение предмета',
    name: 'Новое название предмета',
    types: {
      charm: 'Чары',
      stone: 'Камень',
      gem: 'Самоцвет',
      armor_stone: 'Камень'
    },
    upgradeItem: 'Улучшить предмет'
  }
}

export const DaggerheartItemUpgrade = (props) => {
  const item = () => props.item;
  const state = () => props.state;

  const [name, setName] = createSignal(item().name);
  const [upgrades, setUpgrades] = createStore({});

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const availableUpgrades = createMemo(() => {
    if (item().kind === 'armor') return ['armor_stone'];

    return ['charm', 'stone', 'gem'];
  });

  const upgradeItem = async () => {
    const result = await createUpgradeRequest(
      appState.accessToken, 'daggerheart', props.characterId, item().id, {
        upgrade: { state: state(), name: name(), upgrades: upgrades }
      }
    )
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.completeUpgrade(result);
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
      <For each={availableUpgrades()}>
        {(upgradeType) =>
          <>
            <Select
              containerClassList="mt-2"
              labelText={localize(TRANSLATION, locale()).types[upgradeType]}
              items={Object.fromEntries(props.upgradeItems.filter((item) => item.info.type === upgradeType).map((item) => [item.id, item.name]))}
              selectedValue={upgrades[upgradeType]}
              onSelect={(value) => setUpgrades({ ...upgrades, [upgradeType]: value })}
            />
            <Show when={upgrades[upgradeType]}>
              <Show
                when={upgradeType === 'gem'}
                fallback={
                  <p class="text-sm mt-1">{props.upgradeItems.find(({ id }) => upgrades[upgradeType] === id).info.feature[locale()]}</p>
                }
              >
                <p class="text-sm mt-1">Характеристика для атак - {localize(config.traits[props.upgradeItems.find(({ id }) => upgrades[upgradeType] === id).info.trait].name, locale())}</p>
              </Show>
            </Show>
          </>
        }
      </For>

      <Button default textable classList="mt-4" onClick={upgradeItem}>
        {localize(TRANSLATION, locale()).upgradeItem}
      </Button>
    </div>
  );
}
