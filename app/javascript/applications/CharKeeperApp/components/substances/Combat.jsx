import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper, createModal, Button, Select } from '../../components';
import daggerheartConfig from '../../data/daggerheart.json';
import { useAppState, useAppLocale } from '../../context';
import { Edit } from '../../assets';
import { modifier, readFromCache, writeToCache, localize } from '../../helpers';
import { fetchTagInfoRequest } from '../../requests/fetchTagInfoRequest';

const DISTANCE_SETTINGS_CACHE_NAME = 'DistanceSettings';
const TRANSLATION = {
  en: {
    attack: 'Attack',
    damage: 'Damage',
    distance: 'Range',
    primary: 'Ready to use',
    additional: 'Reserve',
    showSquares: 'Show square distance',
    narrative: 'Narrative distance',
    imperial: 'Imperial distance',
    metric: 'Metric distance',
    settings: 'Distance settings',
    daggerheart: {
      'melee': 'Melee',
      'very close': 'V Close',
      'close': 'Close',
      'far': 'Far',
      'very far': 'V Far'
    },
    squares: 'sq',
    feet: 'ft',
    meters: 'm'
  },
  ru: {
    attack: 'Атака',
    damage: 'Урон',
    distance: 'Дист',
    primary: 'Подготовленное',
    additional: 'Запасное',
    showSquares: 'Дистанция в квадратах',
    narrative: 'Нарративная дистанция',
    imperial: 'Имперская система',
    metric: 'Метрическая система',
    settings: 'Настройки дистанции',
    daggerheart: {
      'melee': 'Вплотную',
      'very close': 'Близко',
      'close': 'Средне',
      'far': 'Далеко',
      'very far': 'Оч далеко'
    },
    squares: 'кв',
    feet: 'фт',
    meters: 'м'
  }
}
const DH_SQUARE_DISTANCES = {
  'melee': 1,
  'very close': 3,
  'close': 6,
  'far': 12,
  'very far': 24
}

export const Combat = (props) => {
  const character = () => props.character;

  const [showSettings, setShowSettings] = createSignal(false);
  const [settings, setSettings] = createSignal({});

  const [tagInfo, setTagInfo] = createSignal([]);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const { Modal, openModal } = createModal();
  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const readDistanceSettings = async () => {
    const cacheValue = await readFromCache(DISTANCE_SETTINGS_CACHE_NAME);
    setSettings(cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue));
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
    readDistanceSettings();
  });

  const distanceOptions = createMemo(() => {
    const result = {}

    if (character().provider === 'daggerheart') result.narrative = localize(TRANSLATION, locale()).narrative;

    return {
      ...result,
      'showSquares': localize(TRANSLATION, locale()).showSquares,
      'imperial': localize(TRANSLATION, locale()).imperial,
      'metric': localize(TRANSLATION, locale()).metric
    };
  });

  const showTagInfo = async (tag, value) => {
    const provider = character().provider === 'dnd5' || character().provider === 'dnd2024' ? 'dnd' : character().provider;
    const result = await fetchTagInfoRequest(appState.accessToken, provider, 'weapon', tag);
    batch(() => {
      openModal();
      setTagInfo([value, result.value]);
    });
  }

  const updateSettings = (value) => {
    const newValue = { ...settings(), [character().provider]: value }
    batch(() => {
      writeToCache(DISTANCE_SETTINGS_CACHE_NAME, JSON.stringify(newValue));
      setSettings(newValue);
    })
  }

  const openAttackRoll = (attack, attackBonus) => {
    const dices = attack.damage.toString().split('+').reduce((acc, item) => {
      if (!item.includes('d')) return acc;

      const parsedItem = item.split('d');
      for (var i = 0; i < parsedItem[0]; i++) {
        acc.push(`D${parsedItem[1]}`)
      }
      return acc;
    }, []);

    if (dices.length > 0) {
      props.openAttackRoll(`/check attack "${attack.name}"`, attackBonus, attack.name, dices, attack.damage_bonus);
    } else {
      props.openDiceRoll(`/check attack "${attack.name}"`, attackBonus, attack.name);
    }
  }

  const renderAttackDistance = (attack) => {
    const provider = character().provider;
    if (provider === 'daggerheart') {
      if (settings()[provider] === 'narrative' || settings()[provider] === undefined) {
        return localize(TRANSLATION, locale()).daggerheart[attack.range];
      }
    }

    const squares = provider === 'daggerheart' ? DH_SQUARE_DISTANCES[attack.range] : (attack.distance || attack.range);
    if (!squares) return '';

    if (settings()[provider] === 'imperial') return `${squares * 5} ${localize(TRANSLATION, locale()).feet}`;
    if (settings()[provider] === 'metric') return `${squares * 1.5} ${localize(TRANSLATION, locale()).meters}`;

    return `${squares} ${localize(TRANSLATION, locale()).squares}`;
  }

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="py-4 px-2 md:px-4 mb-2">
        <h2 class="weapon-title">{title}</h2>
        <div>
          <For each={values}>
            {(attack) =>
              <div class="weapon-item">
                <div class="weapon-item-header">
                  <p class="weapon-item-name">{attack.name}</p>
                  <div class="weapon-item-stats">
                    <div class="weapon-damage">
                      <Show when={character().provider === 'daggerheart' && attack.trait}>
                        <span class="weapon-damage-trait">{daggerheartConfig.traits[attack.trait].shortName[locale()]}</span>
                      </Show>
                      <Dice width="28" height="28" text={modifier(attack.attack_bonus)} onClick={() => openAttackRoll(attack, attack.attack_bonus)} />
                      <Show when={attack.thrown_attack_bonus}>
                        <span> / </span>
                        <Dice width="28" height="28" text={modifier(attack.thrown_attack_bonus)} onClick={() => openAttackRoll(attack, attack.thrown_attack_bonus)} />
                      </Show>
                    </div>
                    <p>{attack.damage}{attack.damage_bonus !== 0 ? modifier(attack.damage_bonus) : ''}</p>
                    <p class="text-sm">{renderAttackDistance(attack)}</p>
                  </div>
                </div>
                <Show when={attack.tags && Object.keys(attack.tags).length > 0}>
                  <div class="weapon-tags">
                    <For each={Object.entries(attack.tags)}>
                      {([tag, value]) =>
                        <p class="tag" onClick={() => showTagInfo(tag, value)}>{value}</p>
                      }
                    </For>
                  </div>
                </Show>
                <Show when={(attack.tags === undefined || character().provider === 'daggerheart') && attack.features && attack.features.length > 0}>
                  <p class="weapon-features">
                    {typeof attack.features[0] === 'string' ? attack.features.join(', ') : attack.features.map((item) => item[locale()]).join(', ')}
                  </p>
                </Show>
              </div>
            }
          </For>
        </div>
      </div>
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Combat' }}>
      <GuideWrapper character={character()}>
        <div class="blockable relative">
          <Show when={showSettings()}>
            <div class="p-4 pb-0">
              <Select
                containerClassList="weapon-settings-select"
                labelText={localize(TRANSLATION, locale()).settings}
                items={distanceOptions()}
                selectedValue={settings()[character().provider]}
                onSelect={updateSettings}
              />
            </div>
          </Show>
          {renderAttacksBox(localize(TRANSLATION, locale()).primary, character().attacks.filter((item) => item.ready_to_use))}
          {renderAttacksBox(localize(TRANSLATION, locale()).additional, character().attacks.filter((item) => !item.ready_to_use))}
          <Button default classList="weapon-settings min-w-6 min-h-6" onClick={() => setShowSettings(!showSettings())}><Edit /></Button>
        </div>
        <Modal classList="md:max-w-md!">
          <p class="mb-3 text-xl">{tagInfo()[0]}</p>
          <p>{tagInfo()[1]}</p>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
