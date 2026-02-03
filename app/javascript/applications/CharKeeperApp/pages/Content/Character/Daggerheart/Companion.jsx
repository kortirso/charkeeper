import { createSignal, createEffect, Show, batch, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartExperience } from '../../../../pages';
import { ErrorWrapper, Input, Button, EditWrapper, Checkbox, GuideWrapper } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';
import { readFromCache, localize } from '../../../../helpers';

const DAMAGE = ['d6', 'd8', 'd10', 'd12'];
const DISTANCE = ['melee', 'very close', 'close', 'far'];

const TRANSLATION = {
  en: {
    name: "Companion's name",
    evasion: 'Evasion',
    damage: 'Damage',
    distance: 'Distance',
    leveling: {
      intelligent: 'Intelligent',
      light: 'Light in the Dark',
      comfort: 'Creature comfort',
      armored: 'Armored',
      vicious: 'Vicious',
      resilient: 'Resilient',
      bonded: 'Bonded',
      aware: 'Aware'
    },
    levelingDescriptions: {
      intelligent: 'Your companion gains a permanent +1 bonus to a Companion Experience of your choice.',
      light: 'Your character gains additional Hope.',
      comfort: 'Once per rest, when you take time during a quiet moment to give your companion love and attention, you can gain a Hope or you can both clear a Stress.',
      armored: 'When your companion takes damage, you can mark one of your Armor Slots instead of marking one of their Stress.',
      vicious: "Increase your companion's damage dice or range by one step.",
      resilient: 'Your companion gains an additional Stress slot.',
      bonded: 'When you mark your last Hit Point, your companion rushes to your side to comfort you. Roll a number of d6s equal to the unmarked Stress slots they have and mark them. If any roll a 6, your companion helps you up. Clear your last Hit Point and return to the scene.',
      aware: 'Your companion gains a permanent +2 bonus to their Evasion.'
    },
    distances: {
      'melee': 'Melee',
      'very close': 'V Close',
      'close': 'Close',
      'far': 'Far',
      'very far': 'V Far'
    },
    squares: 'sq',
    feet: 'ft',
    meters: 'm',
    training: 'Training',
    availableTraining: 'Available options for your companion'
  },
  ru: {
    name: 'Имя компаньона',
    evasion: 'Уклонение',
    damage: 'Урон',
    distance: 'Дистанция',
    leveling: {
      intelligent: 'Умный',
      light: 'Свет в темноте',
      comfort: 'Утешение',
      armored: 'Бронированный',
      vicious: 'Свирепый',
      resilient: 'Устойчивый',
      bonded: 'Связанные',
      aware: 'Осторожность'
    },
    levelingDescriptions: {
      intelligent: 'Ваш компаньон получает постоянный бонус +1 к Опыту компаньона по вашему выбору.',
      light: 'Ваш персонаж получает ячейку надежды.',
      comfort: 'Один раз за отдых, когда вы найдете тихий момент, чтобы проявить любовь и внимание к своему компаньону, вы можете получить Надежду или оба можете снять Стресс.',
      armored: 'Когда ваш компаньон получает урон, вы можете отметить одну из своих ячеек Брони вместо того, чтобы отметить одну из его ячеек Стресса.',
      vicious: 'Увеличьте кости урона или дистанцию вашего компаньона на один шаг.',
      resilient: 'Ваш компаньон получает дополнительную Ячейку Стресса.',
      bonded: 'Когда вы отмечаете свою последнюю Рану, ваш компаньон спешит утешить вас. Бросьте d6 кубиков, равное количеству неотмеченных ячеек Стресса у вашего компаньона, и отметьте их. Если на любом кубике выпало 6, ваш компаньон помогает вам встать. Удалите последнюю Рану и вернитесь на место событий.',
      aware: 'Ваш компаньон получает постоянный бонус +2 к Уклонению.'
    },
    distances: {
      'melee': 'Вплотную',
      'very close': 'Близко',
      'close': 'Средне',
      'far': 'Далеко',
      'very far': 'Оч далеко'
    },
    squares: 'кв',
    feet: 'фт',
    meters: 'м',
    training: 'Обучение',
    availableTraining: 'Доступно опций для выбора для вашего компаньона'
  }
}
const DISTANCE_SETTINGS_CACHE_NAME = 'DistanceSettings';
const DH_SQUARE_DISTANCES = {
  'melee': 1,
  'very close': 3,
  'close': 6,
  'far': 12,
  'very far': 24
}

export const DaggerheartCompanion = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [settings, setSettings] = createSignal({});

  const [companion, setCompanion] = createSignal(undefined);
  const [name, setName] = createSignal('');

  const [editNameMode, setEditNameMode] = createSignal(false);
  const [editDamageMode, setEditDamageMode] = createSignal(false);
  
  const [nameData, setNameData] = createSignal(undefined);
  const [damageData, setDamageData] = createSignal(undefined);
  const [distanceData, setDistanceData] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const readDistanceSettings = async () => {
    const cacheValue = await readFromCache(DISTANCE_SETTINGS_CACHE_NAME);
    setSettings(cacheValue === null || cacheValue === undefined ? {} : JSON.parse(cacheValue));
  }

  createEffect(() => {
    if (!character().can_have_companion) return;
    if (lastActiveCharacterId() === character().id) return;

    const fetchCompanion = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCompanion()]).then(
      ([companionData]) => {
        if (companionData.errors) {
          setCompanion(null);
        } else {
          batch(() => {
            setNameData(companionData.companion.name)
            setDamageData(companionData.companion.damage);
            setDistanceData(companionData.companion.distance);
            setCompanion(companionData.companion);
          });
        }
      }
    );

    setLastActiveCharacterId(character().id);
    readDistanceSettings();
  });

  const renderAttackDistance = (distance) => {
    if (settings().daggerheart === 'narrative' || settings().daggerheart === undefined) {
      return localize(TRANSLATION, locale()).distances[distance];
    }

    const squares = DH_SQUARE_DISTANCES[distance];
    if (!squares) return '';

    if (settings().daggerheart === 'imperial') return `${squares * 5} ${localize(TRANSLATION, locale()).feet}`;
    if (settings().daggerheart === 'metric') return `${squares * 1.5} ${localize(TRANSLATION, locale()).meters}`;

    return `${squares} ${localize(TRANSLATION, locale()).squares}`;
  }

  const createCompanion = async () => {
    const result = await createCompanionRequest(appState.accessToken, character().provider, character().id, { name: name() });

    if (result.errors_list === undefined) {
      batch(() => {
        setDamageData(result.companion.damage);
        setDistanceData(result.companion.distance);
        setCompanion(result.companion);
      });
    } else renderAlerts(result.errors_list);
  }

  const cancelDamageEditing = () => {
    batch(() => {
      setDamageData(companion().damage);
      setDistanceData(companion().distance);
      setEditDamageMode(false);
    });
  }

  const cancelNameEditing = () => {
    batch(() => {
      setNameData(companion().name);
      setEditNameMode(false);
    });
  }

  const changeDamage = (direction) => {
    const currentIndex = DAMAGE.indexOf(damageData());
    if (direction === 1 && currentIndex === 3) return;
    if (direction === -1 && currentIndex === 0) return;

    setDamageData(DAMAGE[currentIndex + direction]);
  }

  const changeDistance = (direction) => {
    const currentIndex = DISTANCE.indexOf(distanceData());
    if (direction === 1 && currentIndex === 3) return;
    if (direction === -1 && currentIndex === 0) return;

    setDistanceData(DISTANCE[currentIndex + direction]);
  }

  const updateStress = (value) => {
    const newValue = companion().stress_marked === value ? (value - 1) : value;
    updateCompanion({ stress_marked: newValue });
  }

  const updateLeveling = async (key, value) => {
    const newValue = companion().leveling[key] === value ? (value - 1) : value;
    updateCompanion({ leveling: { ...companion().leveling, [key]: newValue } });
    props.onReloadCharacter();
  }

  const updateCompanion = async (payload, callback = null) => {
    const result = await updateCompanionRequest(
      appState.accessToken, character().provider, character().id, { companion: payload }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        setCompanion(result.companion);
        if (callback) callback(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartCompanion' }}>
      <GuideWrapper character={character()}>
        <Show when={character().can_have_companion}>
          <Show
            when={companion()}
            fallback={
              <>
                <Input
                  containerClassList="mb-4"
                  labelText={localize(TRANSLATION, locale()).name}
                  value={name()}
                  onInput={setName}
                />
                <Button default onClick={createCompanion}>{t('create')}</Button>
              </>
            }
          >
            <div class="flex flex-col emd:flex-row gap-4">
              <div class="flex-1">
                <EditWrapper
                  editMode={editNameMode()}
                  onSetEditMode={setEditNameMode}
                  onCancelEditing={cancelNameEditing}
                  onSaveChanges={() => updateCompanion({ name: nameData() }, setEditNameMode)}
                >
                  <div class="p-4 blockable">
                    <Show when={editNameMode()} fallback={<p class="text-xl">{companion().name}</p>}>
                      <Input
                        containerClassList="mb-4"
                        labelText={localize(TRANSLATION, locale()).name}
                        value={nameData()}
                        onInput={setNameData}
                      />
                    </Show>
                    <div class="mt-4">
                      <p class="text-sm/4 uppercase mb-1">{t('daggerheart.health.stress')}</p>
                      <div class="flex">
                        <For each={Array.from([...Array(companion().stress_max).keys()], (x) => x + 1)}>
                          {(index) =>
                            <Checkbox
                              filled
                              checked={companion().stress_marked >= index}
                              classList="mr-1"
                              onToggle={() => updateStress(index)}
                            />
                          }
                        </For>
                      </div>
                    </div>
                  </div>
                </EditWrapper>
                <EditWrapper
                  editMode={editDamageMode()}
                  onSetEditMode={setEditDamageMode}
                  onCancelEditing={cancelDamageEditing}
                  onSaveChanges={() => updateCompanion({ damage: damageData(), distance: distanceData() }, setEditDamageMode)}
                >
                  <div class="blockable p-4 mt-4">
                    <div class="grid grid-cols-3 gap-2">
                      <div>
                        <p class="text-sm uppercase text-center mb-4">{localize(TRANSLATION, locale()).evasion}</p>
                        <p class="font-normal! text-center">
                          {companion().evasion}
                        </p>
                      </div>
                      <div>
                        <p class="text-sm uppercase text-center mb-4">{localize(TRANSLATION, locale()).damage}</p>
                        <p class="font-normal! text-center">
                          {editDamageMode() ? damageData() : `${character().proficiency}${companion().damage}`}
                        </p>
                        <Show when={editDamageMode()}>
                          <div class="mt-2 flex justify-center gap-2">
                            <Button default size="small" onClick={() => changeDamage(-1)}><Minus /></Button>
                            <Button default size="small" onClick={() => changeDamage(1)}><Plus /></Button>
                          </div>
                        </Show>
                      </div>
                      <div>
                        <p class="text-sm uppercase text-center mb-4">{localize(TRANSLATION, locale()).distance}</p>
                        <p class="font-normal! text-center">
                          {editDamageMode() ? renderAttackDistance(distanceData()) : renderAttackDistance(companion().distance)}
                        </p>
                        <Show when={editDamageMode()}>
                          <div class="mt-2 flex justify-center gap-2">
                            <Button default size="small" onClick={() => changeDistance(-1)}><Minus /></Button>
                            <Button default size="small" onClick={() => changeDistance(1)}><Plus /></Button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>
                </EditWrapper>
                <div class="mt-4">
                  <DaggerheartExperience object={companion()} callback={updateCompanion} />
                </div>
              </div>
              <div class="flex-1">
                <div class="p-4 blockable">
                  <h2 class="text-lg mb-2">{localize(TRANSLATION, locale()).training}</h2>
                  <p class="text-sm mb-4">{localize(TRANSLATION, locale()).availableTraining} - {character().level - 1}</p>
                  <For
                    each={[
                      { max: 3, attribute: 'intelligent' },
                      { max: 1, attribute: 'light' },
                      { max: 1, attribute: 'comfort' },
                      { max: 1, attribute: 'armored' },
                      { max: 3, attribute: 'vicious' },
                      { max: 3, attribute: 'resilient' },
                      { max: 1, attribute: 'bonded' },
                      { max: 3, attribute: 'aware' }
                    ]}
                  >
                    {(item, index) =>
                      <div class="p-2" classList={{ 'bg-gray-50 dark:bg-neutral-700': index() % 2 === 1 }}>
                        <div class="flex items-center mb-1">
                          <p class="text-sm/4 uppercase mr-4">{localize(TRANSLATION, locale()).leveling[item.attribute]}</p>
                          <div class="flex">
                            <For each={Array.from([...Array(item.max).keys()], (x) => x + 1)}>
                              {(index) =>
                                <Checkbox
                                  filled
                                  checked={companion().leveling[item.attribute] >= index}
                                  classList="mr-1"
                                  onToggle={() => updateLeveling(item.attribute, index)}
                                />
                              }
                            </For>
                          </div>
                        </div>
                        <p class="text-xs">{localize(TRANSLATION, locale()).levelingDescriptions[item.attribute]}</p>
                      </div>
                    }
                  </For>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
