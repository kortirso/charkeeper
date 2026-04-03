import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import {
  ErrorWrapper, Input, Button, EditWrapper, GuideWrapper, AvatarInput, TextArea, Dice, StatsBlock
} from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Avatar, Minus, Plus } from '../../../../assets';
import config from '../../../../data/pathfinder2.json';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';
import { localize, modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: "Companion's name",
    create: 'Create',
    caption: 'Caption',
    armorClass: 'Armor Class',
    perception: 'Perception',
    speed: 'Speed',
    current: 'Health',
    max: 'Max health',
    temp: 'Temp health',
    damage: 'Damage',
    heal: 'Heal'
  },
  ru: {
    name: 'Имя любимца',
    create: 'Добавить',
    caption: 'Описание',
    armorClass: 'Класс брони',
    perception: 'Восприятие',
    speed: 'Скорость',
    current: 'Хиты',
    max: 'Макс хиты',
    temp: 'Врем хиты',
    damage: 'Урон',
    heal: 'Лечение'
  },
  es: {
    name: 'Nombre del compañero',
    create: 'Create',
    caption: 'Caption',
    armorClass: 'Armor Class',
    perception: 'Perception',
    speed: 'Speed',
    current: 'Health',
    max: 'Max health',
    temp: 'Temp health',
    damage: 'Damage',
    heal: 'Heal'
  }
}

export const Pathfinder2Companion = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [companion, setCompanion] = createSignal(undefined);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [form, setForm] = createStore({ name: '', caption: '' });

  const [editMode, setEditMode] = createSignal(false);
  const [damageHealValue, setDamageHealValue] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (!character().can_have_pet && !character().can_have_familiar) return;
    if (lastActiveCharacterId() === character().id) return;

    const fetchCompanion = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id);

    Promise.all([fetchCompanion()]).then(
      ([companionData]) => {
        if (companionData.errors) {
          setCompanion(null);
        } else {
          batch(() => {
            setForm({ name: companionData.pet.name, caption: companionData.pet.caption, kind: companionData.pet.data.kind });
            setCompanion(companionData.pet);
          });
        }
      }
    );

    setLastActiveCharacterId(character().id);
  });

  const createCompanion = async () => {
    const result = await createCompanionRequest(
      appState.accessToken, character().provider, character().id, { ...form, kind: character().can_have_familiar ? 'familiar' : 'pet' }
    );

    if (result.errors_list === undefined) {
      setCompanion(result.pet);
    } else renderAlerts(result.errors_list);
  }

  const cancelNameEditing = () => setEditMode(false);

  const changeHealth = async (coefficient) => {
    const damageValue = parseInt(damageHealValue()) || 0;
    if (damageValue === 0) return;

    const payload = {};
    if (coefficient === 1) {
      payload.health = Math.min(companion().health + damageValue, companion().health_max)
    } else {
      if (companion().health_temp >= damageValue) {
        payload.health_temp = companion().health_temp - damageValue;
      } else {
        const realDamage = damageValue - companion().health_temp;
        payload.health_temp = 0;
        payload.health = Math.max(companion().health - realDamage, 0);
      }
    }
    updateCompanion({ data: payload }, null, false, true);
    setCompanion({ ...companion(), ...payload })
  }

  const changeTempHealth = async (value) => {
    const payload = { health_temp: Math.max(companion().health_temp + value, 0) }

    updateCompanion({ data: payload }, null, false, true);
    setCompanion({ ...companion(), ...payload })
  }

  const changeCompanion = () => {
    const formData = new FormData();
    if (companion().name !== form.name) formData.append('name', form.name);
    if (companion().caption !== form.caption) formData.append('caption', form.caption);
    if (selectedFile()) formData.append('file', selectedFile());

    updateCompanion(formData, setEditMode, true);
  }

  const updateCompanion = async (payload, callback = null, asFormData = false, onlyHead = false) => {
    const resultPayload = asFormData ? payload : { pet: payload };
    if (onlyHead) resultPayload.only_head = true;

    const result = await updateCompanionRequest(
      appState.accessToken, character().provider, character().id, resultPayload, asFormData
    );

    if (result.errors_list === undefined) {
      batch(() => {
        if (!onlyHead) setCompanion(result.pet);
        if (callback) callback(false);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Companion' }}>
      <GuideWrapper character={character()}>
        <Show
          when={companion()}
          fallback={
            <>
              <Input
                containerClassList="mb-4"
                labelText={localize(TRANSLATION, locale()).name}
                value={form.name}
                onInput={(value) => setForm({ ...form, name: value })}
              />
              <Button default onClick={createCompanion}>{localize(TRANSLATION, locale()).create}</Button>
            </>
          }
        >
          <EditWrapper
            editMode={editMode()}
            onSetEditMode={setEditMode}
            onCancelEditing={cancelNameEditing}
            onSaveChanges={changeCompanion}
          >
            <div class="blockable py-4 px-2 md:px-4 mb-2">
              <Show
                when={editMode()}
                fallback={
                  <>
                    <div class="flex">
                      <div class="avatar-block">
                        <Show when={companion().avatar} fallback={<Avatar width={64} height={64} />}>
                          <img src={companion().avatar} class="avatar" />
                        </Show>
                      </div>
                      <div class="flex-1">
                        <p class="text-xl">{companion().name}</p>
                        <p class="mt-2">{companion().caption}</p>
                      </div>
                    </div>
                  </>
                }
              >
                <Input
                  containerClassList="mb-2"
                  labelText={localize(TRANSLATION, locale()).name}
                  value={form.name}
                  onInput={(value) => setForm({ ...form, name: value })}
                />
                <TextArea
                  rows="4"
                  containerClassList="mb-2"
                  labelText={localize(TRANSLATION, locale()).caption}
                  value={form.caption}
                  onChange={(value) => setForm({ ...form, caption: value })}
                />
                <AvatarInput onSelectedFile={setSelectedFile} />
              </Show>
            </div>
          </EditWrapper>
          <StatsBlock
            items={[
              { title: localize(TRANSLATION, locale()).armorClass, value: companion().armor_class },
              {
                title: localize(TRANSLATION, locale()).perception,
                value:
                  <Dice
                    width="36"
                    height="36"
                    text={modifier(companion().perception)}
                    onClick={() => props.openDiceRoll('/check initiative empty', companion().perception)}
                  />
              },
              { title: localize(TRANSLATION, locale()).speed, value: companion().speed }
            ]}
          />
          <StatsBlock
            items={[
              { title: localize(TRANSLATION, locale()).current, value: companion().health },
              { title: localize(TRANSLATION, locale()).max, value: companion().health_max },
              {
                title: localize(TRANSLATION, locale()).temp,
                value:
                  <div class="flex items-center gap-4">
                    <Button default size="small" disabled={companion().health_temp === 0} onClick={() => companion().health_temp ? null : changeTempHealth(-1)}><Minus /></Button>
                    {companion().health_temp}
                    <Button default size="small" onClick={() => changeTempHealth(1)} ><Plus /></Button>
                  </div>
              }
            ]}
          >
            <div class="flex items-center pt-0 p-4">
              <Button default textable classList="flex-1" onClick={() => changeHealth(-1)}>
                {localize(TRANSLATION, locale()).damage}
              </Button>
              <Input
                numeric
                containerClassList="w-20 mx-4"
                value={damageHealValue()}
                onInput={setDamageHealValue}
              />
              <Button default textable classList="flex-1" onClick={() => changeHealth(1)}>
                {localize(TRANSLATION, locale()).heal}
              </Button>
            </div>
          </StatsBlock>
          <div class="blockable py-4 px-2 md:px-4 flex mb-2">
            <For each={Object.entries(config.savingThrows)}>
              {([slug, savingName]) =>
                <div class="flex-1 flex flex-col items-center">
                  <p class="text-sm uppercase text-center mb-4">{localize(savingName.name, locale())}</p>
                  <p class="text-2xl font-normal!">
                    <Dice
                      text={modifier(companion().saving_throws_value[slug])}
                      onClick={() => props.openDiceRoll(`/check save ${slug}`, companion().saving_throws_value[slug])}
                    />
                  </p>
                </div>
              }
            </For>
          </div>
          <div class="blockable py-4 px-2 md:px-4">
            <div class="fallout-skills ">
              <For each={Object.keys(config.abilities)}>
                {(slug) =>
                  <For each={companion().skills.filter((item) => item.ability === slug)}>
                    {(skill) =>
                      <div class="fallout-skill">
                        <p class="uppercase mr-4">{skill.ability}</p>
                        <p class="flex-1 flex items-center">
                          {localize(config.skills[skill.slug].name, locale())}
                        </p>
                        <Dice
                          width="28"
                          height="28"
                          text={modifier(skill.modifier)}
                          onClick={() => props.openDiceRoll(`/check skill "${skill.slug}"`, skill.modifier)}
                        />
                      </div>
                    }
                  </For>
                }
              </For>
            </div>
          </div>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
