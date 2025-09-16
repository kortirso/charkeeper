import { createSignal, createEffect, Show, batch, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { DaggerheartExperience } from '../../../../pages';
import { ErrorWrapper, Input, Button, EditWrapper, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';

const DAMAGE = ['d6', 'd8', 'd10', 'd12'];
const DISTANCE = ['melee', 'very close', 'close', 'far'];

export const DaggerheartCompanion = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [companion, setCompanion] = createSignal(undefined);
  const [name, setName] = createSignal('');
  const [editDamageMode, setEditDamageMode] = createSignal(false);
  const [damageData, setDamageData] = createSignal(undefined);
  const [distanceData, setDistanceData] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

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
            setDamageData(companionData.companion.damage);
            setDistanceData(companionData.companion.distance);
            setCompanion(companionData.companion);
          });
        }
      }
    );

    setLastActiveCharacterId(character().id);
  });

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
      <Show
        when={character().can_have_companion}
        fallback={
          <div class="p-4 blockable dark:text-snow">
            <p>{t('daggerheart.companion.notAvailable')}</p>
          </div>
        }
      >
        <Show
          when={companion()}
          fallback={
            <>
              <Input
                containerClassList="mb-4"
                labelText={t('daggerheart.companion.name')}
                value={name()}
                onInput={(value) => setName(value)}
              />
              <Button default onClick={createCompanion}>{t('create')}</Button>
            </>
          }
        >
          <div class="flex flex-col emd:flex-row gap-4">
            <div class="flex-1">
              <div class="p-4 blockable dark:text-snow">
                <p class="text-xl">{companion().name}</p>
                <Show when={companion().caption}>
                  <p class="mt-2">{companion().caption}</p>
                </Show>
                <div class="mt-4">
                  <p class="text-sm/4 uppercase mb-1 dark:text-snow">{t('daggerheart.health.stress')}</p>
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
              <EditWrapper
                editMode={editDamageMode()}
                onSetEditMode={setEditDamageMode}
                onCancelEditing={cancelDamageEditing}
                onSaveChanges={() => updateCompanion({ damage: damageData(), distance: distanceData() }, setEditDamageMode)}
              >
                <div class="grid grid-cols-3 gap-2 mt-4">
                  <div class="blockable py-4">
                    <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{t('daggerheart.companion.evasion')}</p>
                    <div class="mx-auto flex items-center justify-center">
                      <p class="font-normal! dark:text-snow">
                        {companion().evasion}
                      </p>
                    </div>
                  </div>
                  <div class="blockable py-4">
                    <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{t('daggerheart.companion.damage')}</p>
                    <div class="mx-auto flex items-center justify-center">
                      <p class="font-normal! dark:text-snow">
                        {editDamageMode() ? damageData() : companion().damage}
                      </p>
                    </div>
                    <Show when={editDamageMode()}>
                      <div class="mt-2 flex justify-center gap-2">
                        <Button default size="small" onClick={() => changeDamage(-1)}><Minus /></Button>
                        <Button default size="small" onClick={() => changeDamage(1)}><Plus /></Button>
                      </div>
                    </Show>
                  </div>
                  <div class="blockable py-4">
                    <p class="text-sm elg:text-[10px] uppercase text-center mb-4 dark:text-white">{t('daggerheart.companion.distance')}</p>
                    <div class="mx-auto flex items-center justify-center">
                      <p class="font-normal! dark:text-snow">
                        {editDamageMode() ? distanceData() : companion().distance}
                      </p>
                    </div>
                    <Show when={editDamageMode()}>
                      <div class="mt-2 flex justify-center gap-2">
                        <Button default size="small" onClick={() => changeDistance(-1)}><Minus /></Button>
                        <Button default size="small" onClick={() => changeDistance(1)}><Plus /></Button>
                      </div>
                    </Show>
                  </div>
                </div>
              </EditWrapper>
              <div class="mt-4">
                <DaggerheartExperience object={companion()} callback={updateCompanion} />
              </div>
            </div>
            <div class="flex-1">
              <div class="p-4 blockable dark:text-snow">
                <For
                  each={[
                    { title: t('daggerheart.companion.leveling.intelligent'), max: 3, attribute: 'intelligent' },
                    { title: t('daggerheart.companion.leveling.light'), max: 1, attribute: 'light' },
                    { title: t('daggerheart.companion.leveling.comfort'), max: 1, attribute: 'comfort' },
                    { title: t('daggerheart.companion.leveling.armored'), max: 1, attribute: 'armored' },
                    { title: t('daggerheart.companion.leveling.vicious'), max: 3, attribute: 'vicious' },
                    { title: t('daggerheart.companion.leveling.resilient'), max: 3, attribute: 'resilient' },
                    { title: t('daggerheart.companion.leveling.bonded'), max: 1, attribute: 'bonded' },
                    { title: t('daggerheart.companion.leveling.aware'), max: 3, attribute: 'aware' }
                  ]}
                >
                  {(item) =>
                    <div class="mt-2">
                      <p class="text-sm/4 uppercase mb-1 dark:text-snow">{item.title}</p>
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
                  }
                </For>
              </div>
            </div>
          </div>
        </Show>
      </Show>
    </ErrorWrapper>
  );
}
