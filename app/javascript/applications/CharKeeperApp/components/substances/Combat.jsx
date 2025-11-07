import { createSignal, createEffect, For, Show, batch, Switch, Match } from 'solid-js';

import { ErrorWrapper, Dice, GuideWrapper, createModal, Button, Select } from '../../components';
import { useAppState, useAppLocale } from '../../context';
import { Edit } from '../../assets';
import { modifier, readFromCache, writeToCache } from '../../helpers';
import { fetchTagInfoRequest } from '../../requests/fetchTagInfoRequest';

const DH_SETTINGS_CACHE_NAME = 'DaggerheartSettings';
const TRANSLATION = {
  en: {
    attack: 'Attack',
    damage: 'Damage',
    distance: 'Range',
    primary: 'Ready to use',
    additional: 'Reserve',
    showSquares: 'Show square distance',
    settings: 'Settings',
    distances: {
      'melee': 'Melee',
      'very close': 'V Close',
      'close': 'Close',
      'far': 'Far',
      'very far': 'V Far'
    }
  },
  ru: {
    attack: 'Атака',
    damage: 'Урон',
    distance: 'Дист',
    primary: 'Подготовленное',
    additional: 'Запасное',
    showSquares: 'Дистанция в квадратах',
    settings: 'Настройки',
    distances: {
      'melee': 'Вплотную',
      'very close': 'Близко',
      'close': 'Средне',
      'far': 'Далеко',
      'very far': 'Оч далеко'
    }
  }
}
const DH_SQUARE_DISTANCES = {
  'melee': 5,
  'very close': 15,
  'close': 30,
  'far': 60,
  'very far': '>60'
}

export const Combat = (props) => {
  const character = () => props.character;

  const [showSettings, setShowSettings] = createSignal(false);
  const [settings, setSettings] = createSignal([]);
  const [tagInfo, setTagInfo] = createSignal([]);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const { Modal, openModal } = createModal();
  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const readDhSettings = async () => {
    const cacheValue = await readFromCache(DH_SETTINGS_CACHE_NAME);
    setSettings(cacheValue === null ? [] : cacheValue.split(','));
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setLastActiveCharacterId(character().id);
    if (character().provider === 'daggerheart') readDhSettings();
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
    const newValue = settings().includes(value) ? settings().filter((item) => item !== value) : settings().concat([value]);
    batch(() => {
      if (character().provider === 'daggerheart') writeToCache(DH_SETTINGS_CACHE_NAME, newValue.join(','));
      setSettings(newValue);
    })
  }

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 mb-2">
        <h2 class="text-lg font-normal! mb-2 dark:text-snow">{title}</h2>
        <table class="w-full table no-darks first-column-full-width table-top">
          <thead>
            <tr>
              <td />
              <td class="text-center dark:text-snow">{TRANSLATION[locale()]['attack']}</td>
              <td class="text-center dark:text-snow px-1">{TRANSLATION[locale()]['damage']}</td>
              <td class="text-center dark:text-snow px-1">{TRANSLATION[locale()]['distance']}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) =>
                <>
                  <tr class="dark:text-snow border-t! border-gray-200! dark:border-neutral-800!">
                    <td class="pt-2 pb-1 pl-1">
                      <p>{attack.name}</p>
                    </td>
                    <td class="pt-2 pb-1 text-center">
                      <Dice
                        width="28"
                        height="28"
                        text={modifier(attack.attack_bonus)}
                        onClick={() => props.openDiceRoll(`/check attack ${attack.name}`, attack.attack_bonus)}
                      />
                    </td>
                    <td class="pt-2 pb-1 text-center">
                      <p>{attack.damage}{attack.damage_bonus > 0 ? modifier(attack.damage_bonus) : ''}</p>
                    </td>
                    <td class="pt-2 pb-1 text-center">
                      <Show when={character().provider === 'daggerheart'} fallback={<p>{attack.distance || attack.range}</p>}>
                        <Show
                          when={settings().includes('showSquares')}
                          fallback={<p class="text-sm">{TRANSLATION[locale()]['distances'][attack.range]}</p>}
                        >
                          <p>{DH_SQUARE_DISTANCES[attack.range]}</p>
                        </Show>
                      </Show>
                    </td>
                  </tr>
                  <Show when={attack.tags && Object.keys(attack.tags).length > 0}>
                    <tr>
                      <td colspan="4" class="py-1">
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
                    <tr>
                      <td colspan="4" class="py-1">
                        <p class="text-xs dark:text-snow">
                          {typeof attack.features[0] === 'string' ? attack.features.join(', ') : attack.features.map((item) => item[locale()]).join(', ')}
                        </p>
                      </td>
                    </tr>
                  </Show>
                  <Show when={attack.notes && attack.notes.length > 0}>
                    <tr>
                      <td colspan="4" class="py-1">
                        <p class="text-xs dark:text-snow">{attack.notes}</p>
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
              <Switch>
                <Match when={character().provider === 'daggerheart'}>
                  <Select
                    multi
                    containerClassList="w-full md:w-1/2 mb-2"
                    labelText={TRANSLATION[locale()]['settings']}
                    items={{
                      'showSquares': TRANSLATION[locale()]['showSquares']
                    }}
                    selectedValues={settings() || []}
                    onSelect={(value) => updateSettings(value)}
                  />
                </Match>
              </Switch>
            </div>
          </Show>
          {renderAttacksBox(TRANSLATION[locale()]['primary'], character().attacks.filter((item) => item.ready_to_use))}
          {renderAttacksBox(TRANSLATION[locale()]['additional'], character().attacks.filter((item) => !item.ready_to_use))}
          <Show when={character().provider === 'daggerheart'}>
            <Button
              default
              classList='absolute top-0 right-0 rounded min-w-6 min-h-6 opacity-50 m-0!'
              onClick={() => setShowSettings(!showSettings())}
            >
              <Edit />
            </Button>
          </Show>
        </div>
        <Modal classList="md:max-w-md!">
          <p class="mb-3 text-xl">{tagInfo()[0]}</p>
          <p>{tagInfo()[1]}</p>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
