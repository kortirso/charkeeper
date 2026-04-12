import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Pathfinder2SharedHealth, Pathfinder2SharedSenses } from '../../../../pages';
import {
  ErrorWrapper, Input, Button, EditWrapper, GuideWrapper, AvatarInput, TextArea, Dice, Toggle, Checkbox, Select
} from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Avatar } from '../../../../assets';
import config from '../../../../data/pathfinder2.json';
import { fetchPetFeatsRequest } from '../../../../requests/fetchPetFeatsRequest';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';
import { localize, modifier, translate } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: "Companion's name",
    create: 'Create',
    caption: 'Caption',
    pets: 'Pets feats',
    familiars: 'Familiar feats',
    animalName: "Animal companion's name",
    kind: 'Animal kind'
  },
  ru: {
    name: 'Имя любимца',
    create: 'Добавить',
    caption: 'Описание',
    pets: 'Черты любимца',
    familiars: 'Черты фамильяра',
    animalName: 'Имя верного зверя',
    kind: 'Вид верного зверя'
  },
  es: {
    name: 'Nombre del compañero',
    create: 'Create',
    caption: 'Caption',
    pets: 'Pets feats',
    familiars: 'Familiar feats',
    animalName: 'Nombre del animal',
    kind: 'Especie animal'
  }
}

export const Pathfinder2Companion = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);

  const [companion, setCompanion] = createSignal(undefined);
  const [petFeats, setPetFeats] = createSignal([]);
  const [familiarFeats, setFamiliarFeats] = createSignal([]);
  const [selectedFile, setSelectedFile] = createSignal(null);
  const [form, setForm] = createStore({ name: '', caption: '', kind: null });

  const [editMode, setEditMode] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (!character().can_have_pet && !character().can_have_familiar) return;
    if (lastActiveCharacterId() === character().id) return;

    const fetchAnimal = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id, 'animals');
    const fetchCompanion = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id);
    const fetchPetFeats = async () => await fetchPetFeatsRequest(appState.accessToken, character().provider);

    if (props.type === 'pet') {
      Promise.all([fetchCompanion(), fetchPetFeats()]).then(
        ([companionData, featsData]) => {
          batch(() => {
            if (companionData.errors) {
              setCompanion(null);
            } else {
              setForm({ name: companionData.pet.name, caption: companionData.pet.caption, kind: companionData.pet.data.kind });
              setCompanion(companionData.pet);
            }
            setPetFeats(featsData.feats.filter((item) => item.origin === 'pet'));
            if (character().can_have_familiar) setFamiliarFeats(featsData.feats.filter((item) => item.origin === 'familiar'));
          });
        }
      );
    } else {
      Promise.all([fetchAnimal()]).then(
        ([companionData]) => {
          batch(() => {
            if (companionData.errors) {
              setCompanion(null);
            } else {
              setForm({ name: companionData.animal.name, caption: companionData.animal.caption });
              setCompanion(companionData.animal);
            }
          });
        }
      );
    }

    setLastActiveCharacterId(character().id);
  });

  const createCompanion = async () => {
    const result = await createCompanionRequest(
      appState.accessToken, character().provider, character().id, { ...form, kind: form.kind || (character().can_have_familiar ? 'familiar' : 'pet') }, (props.type === 'pet' ? 'companions' : 'animals')
    );

    if (result.errors_list === undefined) {
      setCompanion(result[props.type]);
    } else renderAlerts(result.errors_list);
  }

  const cancelNameEditing = () => setEditMode(false);

  const changeHealth = (coefficient, value) => {
    const damageValue = parseInt(value) || 0;
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

  const changeTempHealth = (value) => {
    const payload = { health_temp: Math.max(companion().health_temp + value, 0) }

    updateCompanion({ data: payload }, null, false, true);
    setCompanion({ ...companion(), ...payload });
  }

  const toggleFeat = (slug) => {
    const newValue = companion().selected_feats.includes(slug) ? companion().selected_feats.filter((item) => item !== slug) : companion().selected_feats.concat(slug);
    const payload = { selected_feats: newValue };

    updateCompanion({ data: payload });
    props.onReloadCharacter();
  }

  const changeCompanion = () => {
    const formData = new FormData();
    if (companion().name !== form.name) formData.append('name', form.name);
    if (companion().caption !== form.caption) formData.append('caption', form.caption);
    if (selectedFile()) formData.append('file', selectedFile());

    updateCompanion(formData, setEditMode, true);
  }

  const updateCompanion = async (payload, callback = null, asFormData = false, onlyHead = false) => {
    const resultPayload = asFormData ? payload : { [props.type]: payload };
    if (onlyHead) resultPayload.only_head = true;

    const result = await updateCompanionRequest(
      appState.accessToken, character().provider, character().id, resultPayload, asFormData, (props.type === 'pet' ? 'companions' : 'animals')
    );

    if (result.errors_list === undefined) {
      batch(() => {
        if (!onlyHead) setCompanion(result[props.type]);
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
                labelText={props.type === 'pet' ? localize(TRANSLATION, locale()).name : localize(TRANSLATION, locale()).animalName}
                value={form.name}
                onInput={(value) => setForm({ ...form, name: value })}
              />
              <Show when={props.type === 'animal'}>
                <Select
                  containerClassList="mb-4"
                  labelText={localize(TRANSLATION, locale()).kind}
                  items={translate(config.animals, locale())}
                  selectedValue={form.kind}
                  onSelect={(value) => setForm({ ...form, kind: value })}
                />
              </Show>
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
                  labelText={props.type === 'pet' ? localize(TRANSLATION, locale()).name : localize(TRANSLATION, locale()).animalName}
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
          <Pathfinder2SharedSenses
            armorClass={companion().armor_class}
            perception={companion().perception}
            speed={companion().speed}
            speeds={companion().speeds}
            openDiceRoll={props.openDiceRoll}
          />
          <Pathfinder2SharedHealth
            currentHealth={companion().health}
            maxHealth={companion().health_max}
            tempHealth={companion().health_temp}
            onChangeHealth={changeHealth}
            onChangeTempHealth={changeTempHealth}
          />
          <Show when={props.type === 'animal'}>
            <div class="blockable py-4 mb-2">
              <div class="grid grid-cols-3 gap-2">
                <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
                  {([slug, ability]) =>
                    <div class="flex flex-col items-center">
                      <p class="companion-ability-title">{ability}</p>
                      <p class="companion-ability-dice">
                        <Dice
                          text={modifier(companion().abilities[slug])}
                          onClick={() => props.openDiceRoll(`/check attr ${slug}`, companion().abilities[slug])}
                        />
                      </p>
                    </div>
                  }
                </For>
              </div>
            </div>
          </Show>
          <div class="blockable py-4 flex mb-2">
            <For each={Object.entries(config.savingThrows)}>
              {([slug, savingName]) =>
                <div class="flex-1 flex flex-col items-center">
                  <p class="companion-ability-title">{localize(savingName.name, locale())}</p>
                  <p class="companion-ability-dice">
                    <Dice
                      text={modifier(companion().saving_throws_value[slug])}
                      onClick={() => props.openDiceRoll(`/check save ${slug}`, companion().saving_throws_value[slug])}
                    />
                  </p>
                </div>
              }
            </For>
          </div>
          <div class="blockable py-4 px-2 md:px-4 mb-2">
            <div class="fallout-skills">
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
          <Show when={props.type === 'pet'}>
            <For each={[petFeats(), familiarFeats()]}>
              {(list, index) => 
                <Show when={list.length > 0}>
                  <Toggle title={index() === 0 ? localize(TRANSLATION, locale()).pets : localize(TRANSLATION, locale()).familiars} innerClassList="pet-feats">
                    <For each={list}>
                      {(feat) =>
                        <div class="pet-feat">
                          <div class="pet-feat-title">
                            <p>{feat.title}</p>
                            <Checkbox checked={companion().selected_feats.includes(feat.slug)} onToggle={() => toggleFeat(feat.slug)} />
                          </div>
                          <p
                            class="feat-markdown"
                            innerHTML={feat.description} // eslint-disable-line solid/no-innerhtml
                          />
                        </div>
                      }
                    </For>
                  </Toggle>
                </Show>
              }
            </For>
          </Show>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
