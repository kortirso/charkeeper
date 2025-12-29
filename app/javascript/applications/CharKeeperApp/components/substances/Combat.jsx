import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper, createModal, Button, Select } from '../../components';
import daggerheartConfig from '../../data/daggerheart.json';
import { useAppState, useAppLocale } from '../../context';
import { Edit } from '../../assets';
import { modifier, readFromCache, writeToCache } from '../../helpers';
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

    if (character().provider === 'daggerheart') result.narrative = TRANSLATION[locale()].narrative;

    return {
      ...result,
      'showSquares': TRANSLATION[locale()].showSquares,
      'imperial': TRANSLATION[locale()].imperial,
      'metric': TRANSLATION[locale()].metric
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

  const openAttackRoll = (attack) => {
    const dices = attack.damage.split('+').reduce((acc, item) => {
      if (!item.includes('d')) return acc;

      const parsedItem = item.split('d');
      for (var i = 0; i < parsedItem[0]; i++) {
        acc.push(`D${parsedItem[1]}`)
      }
      return acc;
    }, []);

    if (dices.length > 0) props.openSimpleDiceRoll(dices, attack.damage_bonus);
  }

  const renderAttackDistance = (attack) => {
    const provider = character().provider;
    if (provider === 'daggerheart') {
      if (settings()[provider] === 'narrative' || settings()[provider] === undefined) {
        return TRANSLATION[locale()].daggerheart[attack.range];
      }
    }

    const squares = provider === 'daggerheart' ? DH_SQUARE_DISTANCES[attack.range] : (attack.distance || attack.range);
    if (!squares) return '';

    if (settings()[provider] === 'imperial') return `${squares * 5} ${TRANSLATION[locale()].feet}`;
    if (settings()[provider] === 'metric') return `${squares * 1.5} ${TRANSLATION[locale()].meters}`;

    return `${squares} ${TRANSLATION[locale()].squares}`;
  }

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 mb-2 dark:text-snow">
        <h2 class="text-lg font-normal! mb-2">{title}</h2>
        <table class="w-full table no-darks first-column-full-width table-top">
          <thead>
            <tr>
              <td />
              <td class="text-center">{TRANSLATION[locale()].attack}</td>
              <td class="text-center px-1">{TRANSLATION[locale()].damage}</td>
              <td class="text-center px-1">{TRANSLATION[locale()].distance}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack, index) =>
                <>
                  <tr class="border-t border-gray-200 dark:border-neutral-800" classList={{ 'bg-gray-50 dark:bg-neutral-700': index() % 2 === 1 }}>
                    <td class="pt-2 pb-1 pl-1">
                      <p>{attack.name}</p>
                    </td>
                    <td class="pt-2 pb-1">
                      <div class="flex items-center justify-center">
                        <Show when={character().provider === 'daggerheart' && attack.trait}>
                          <span class="mr-2 text-sm uppercase">{daggerheartConfig.traits[attack.trait].shortName[locale()]}</span>
                        </Show>
                        <Dice
                          width="28"
                          height="28"
                          text={modifier(attack.attack_bonus)}
                          onClick={() => props.openDiceRoll(`/check attack ${attack.name}`, attack.attack_bonus)}
                        />
                        <Show when={attack.thrown_attack_bonus}>
                          <span> / </span>
                          <Dice
                            width="28"
                            height="28"
                            text={modifier(attack.thrown_attack_bonus)}
                            onClick={() => props.openDiceRoll(`/check attack ${attack.name}`, attack.thrown_attack_bonus)}
                          />
                        </Show>
                      </div>
                    </td>
                    <td class="pt-2 pb-1">
                      <div class="flex items-center justify-center h-7 cursor-pointer">
                        <p onClick={() => openAttackRoll(attack)}>
                          {attack.damage}{attack.damage_bonus !== 0 ? modifier(attack.damage_bonus) : ''}
                        </p>
                      </div>
                    </td>
                    <td class="pt-2 pb-1">
                      <div class="flex items-center justify-center h-7">
                        <p class="text-sm">{renderAttackDistance(attack)}</p>
                      </div>
                    </td>
                  </tr>
                  <Show when={attack.tags && Object.keys(attack.tags).length > 0}>
                    <tr classList={{ 'bg-gray-50 dark:bg-neutral-700': index() % 2 === 1 }}>
                      <td colspan="4" class="p-1">
                        <div class="flex flex-wrap gap-x-2 gap-y-1">
                          <For each={Object.entries(attack.tags)}>
                            {([tag, value]) =>
                              <p class="tag" onClick={() => showTagInfo(tag, value)}>{value}</p>
                            }
                          </For>
                        </div>
                      </td>
                    </tr>
                  </Show>
                  <Show when={(attack.tags === undefined || character().provider === 'daggerheart') && attack.features && attack.features.length > 0}>
                    <tr classList={{ 'bg-gray-50 dark:bg-neutral-700': index() % 2 === 1 }}>
                      <td colspan="4" class="p-1">
                        <p class="text-xs">
                          {typeof attack.features[0] === 'string' ? attack.features.join(', ') : attack.features.map((item) => item[locale()]).join(', ')}
                        </p>
                      </td>
                    </tr>
                  </Show>
                  <Show when={attack.notes && attack.notes.length > 0}>
                    <tr classList={{ 'bg-gray-50 dark:bg-neutral-700': index() % 2 === 1 }}>
                      <td colspan="4" class="p-1">
                        <p class="text-xs">{attack.notes}</p>
                      </td>
                    </tr>
                  </Show>
                </>
              }
            </For>
          </tbody>
        </table>
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
                containerClassList="w-full md:w-1/2 mb-2"
                labelText={TRANSLATION[locale()].settings}
                items={distanceOptions()}
                selectedValue={settings()[character().provider]}
                onSelect={updateSettings}
              />
            </div>
          </Show>
          {renderAttacksBox(TRANSLATION[locale()]['primary'], character().attacks.filter((item) => item.ready_to_use))}
          {renderAttacksBox(TRANSLATION[locale()]['additional'], character().attacks.filter((item) => !item.ready_to_use))}
          <Button
            default
            classList='absolute top-0 right-0 rounded min-w-6 min-h-6 opacity-50 m-0!'
            onClick={() => setShowSettings(!showSettings())}
          >
            <Edit />
          </Button>
        </div>
        <Modal classList="md:max-w-md!">
          <p class="mb-3 text-xl">{tagInfo()[0]}</p>
          <p>{tagInfo()[1]}</p>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
