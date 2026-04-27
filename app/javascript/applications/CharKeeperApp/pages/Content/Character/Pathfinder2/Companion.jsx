import { createSignal, createEffect, Show, For, batch } from 'solid-js';
import { createStore } from 'solid-js/store';

import { Pathfinder2SharedHealth, Pathfinder2SharedSenses } from '../../../../pages';
import {
  ErrorWrapper, Input, Button, EditWrapper, GuideWrapper, AvatarInput, TextArea, Dice, Toggle, Checkbox, Select
} from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Avatar, Close, Upgrade } from '../../../../assets';
import config from '../../../../data/pathfinder2.json';
import { fetchPetFeatsRequest } from '../../../../requests/fetchPetFeatsRequest';
import { fetchCompanionRequest } from '../../../../requests/fetchCompanionRequest';
import { createCompanionRequest } from '../../../../requests/createCompanionRequest';
import { updateCompanionRequest } from '../../../../requests/updateCompanionRequest';
import { removeCompanionRequest } from '../../../../requests/removeCompanionRequest';
import { upgradeCompanionRequest } from '../../../../requests/upgradeCompanionRequest';
import { localize, modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    name: "Companion's name",
    create: 'Create',
    caption: 'Caption',
    pets: 'Pets feats',
    familiars: 'Familiar feats',
    animalName: "Animal companion's name",
    kind: 'Animal kind',
    attacks: 'Attacks',
    support: 'Support',
    animals: {
      ape: 'Ape',
      arboreal_sapling: 'Arboreal Sapling',
      badger: 'Badger',
      bat: 'Bat',
      bear: 'Bear',
      bird: 'Bird',
      boar: 'Boar',
      cat: 'Cat',
      crocodile: 'Crocodile',
      dromaeosaur: 'Dromaeosaur',
      horse: 'Horse',
      riding_drake: 'Riding Drake',
      scorpion: 'Scorpion',
      shark: 'Shark',
      snake: 'Snake',
      wolf: 'Wolf'
    },
    sizes: {
      small: 'Small size',
      medium: 'Medium size',
      large: 'Large size'
    },
    ages: {
      young: 'Young animal',
      mature: 'Mature animal'
    }
  },
  ru: {
    name: 'Имя любимца',
    create: 'Добавить',
    caption: 'Описание',
    pets: 'Черты любимца',
    familiars: 'Черты фамильяра',
    animalName: 'Имя верного зверя',
    kind: 'Вид верного зверя',
    attacks: 'Атаки',
    support: 'Поддержка',
    animals: {
      shark: 'Акула',
      badger: 'Барсук',
      wolf: 'Волк',
      dromaeosaur: 'Дромеозавр',
      riding_drake: 'Ездовой дрейк',
      snake: 'Змея',
      boar: 'Кабан',
      cat: 'Кошка',
      crocodile: 'Крокодил',
      arboreal_sapling: 'Лесовик-росток',
      bat: 'Летучая мышь',
      horse: 'Лошадь',
      bear: 'Медведь',
      ape: 'Примат',
      bird: 'Птица',
      scorpion: 'Скорпион'
    },
    sizes: {
      small: 'Небольшой размер',
      medium: 'Средний размер',
      large: 'Крупный размер'
    },
    ages: {
      young: 'Молодой зверь',
      mature: 'Взрослый зверь'
    }
  },
  es: {
    name: 'Nombre del compañero',
    create: 'Crear',
    caption: 'Comentario',
    pets: 'Proesas de mascota',
    familiars: 'Proesas de familiar',
    animalName: 'Nombre del animal',
    kind: 'Especie animal',
    attacks: 'Ataques',
    support: 'Apoyo',
    animals: {
      ape: 'Simio',
      arboreal_sapling: 'Brote arbóreo',
      badger: 'Tejón',
      bat: 'Murciélago',
      bear: 'Oso',
      bird: 'Pájaro',
      boar: 'Cerdo',
      cat: 'Gato',
      crocodile: 'Cocodrilo',
      dromaeosaur: 'Dromeosauro',
      horse: 'Caballo',
      riding_drake: 'Pato de carga',
      scorpion: 'Escorpión',
      shark: 'Tiburón',
      snake: 'Serpiente',
      wolf: 'Lobo'
    },
    sizes: {
      small: 'Tamaño pequeño',
      medium: 'Tamaño mediano',
      large: 'Tamaño grande'
    },
    ages: {
      young: 'Animal joven',
      mature: 'Animal adulto'
    }
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

  const fetchAnimal = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id, 'animals');
  const fetchCompanion = async () => await fetchCompanionRequest(appState.accessToken, character().provider, character().id);
  const fetchPetFeats = async () => await fetchPetFeatsRequest(appState.accessToken, character().provider);

  createEffect(() => {
    if (!character().can_have_pet && !character().can_have_familiar) return;
    if (lastActiveCharacterId() === character().id) return;

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

  const removeCompanion = async () => {
    const result = await removeCompanionRequest(
      appState.accessToken, character().provider, character().id, (props.type === 'pet' ? 'companions' : 'animals')
    );

    if (result.errors_list === undefined) {
      setCompanion(undefined);
    } else renderAlerts(result.errors_list);
  }

  const upgradeCompanion = async () => {
    const result = await upgradeCompanionRequest(
      appState.accessToken, character().provider, character().id, (props.type === 'pet' ? 'companions' : 'animals')
    );

    if (result.errors_list === undefined) {
      setCompanion(result.animal);
    } else renderAlerts(result.errors_list);
  }

  const openAttackRoll = (attack) => {
    const dices = attack.damage.toString().split('+').reduce((acc, item) => {
      if (!item.includes('d')) return acc;

      const parsedItem = item.split('d');
      for (var i = 0; i < parsedItem[0]; i++) {
        acc.push(`D${parsedItem[1]}`)
      }
      return acc;
    }, []);
    console.log(dices)
    props.openD20Attack(`/check attack "${attack.name}"`, attack.name, attack.attack_bonus, dices, attack.damage_bonus)
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
                  items={localize(TRANSLATION, locale()).animals}
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
            <div class="blockable py-4 px-2 md:px-4 mb-2 relative">
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
                        <Show when={props.type === 'animal'}>
                          <p class="text-sm mt-2">{localize(TRANSLATION, locale()).ages[companion().age]}, {localize(TRANSLATION, locale()).animals[companion().kind]}, {localize(TRANSLATION, locale()).sizes[companion().size]}</p>
                        </Show>
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
              <Show when={!editMode()}>
                <Button default classList="absolute top-0 right-0 rounded min-w-6 min-h-6 opacity-50" onClick={removeCompanion}>
                  <Close />
                </Button>
              </Show>
              <Show when={props.type === 'animal' && !editMode() && companion().age === 'young'}>
                <Button default classList="absolute bottom-0 right-10 rounded min-w-6 min-h-6 opacity-50" onClick={upgradeCompanion}>
                  <Upgrade />
                </Button>
              </Show>
            </div>
          </EditWrapper>
          <Pathfinder2SharedSenses
            armorClass={companion().armor_class}
            perception={companion().perception}
            speed={companion().speed}
            speeds={companion().speeds}
            openD20Test={props.openD20Test}
          />
          <Pathfinder2SharedHealth
            currentHealth={companion().health}
            maxHealth={companion().health_max}
            tempHealth={companion().health_temp}
            onChangeHealth={changeHealth}
            onChangeTempHealth={changeTempHealth}
          />
          <Show when={props.type === 'animal'}>
            <div class="blockable py-4 px-2 md:px-4 mb-2">
              <h2 class="weapon-title">{localize(TRANSLATION, locale()).attacks}</h2>
              <div class="mb-4">
                <For each={companion().attacks}>
                  {(attack) =>
                    <div class="weapon-item">
                      <div class="weapon-item-header flex-row! justify-between! items-center!">
                        <p class="weapon-item-name">{attack.name}</p>
                        <div class="weapon-item-stats">
                          <div class="weapon-damage">
                            <Dice
                              width="28"
                              height="28"
                              text={modifier(attack.attack_bonus)}
                              onClick={() => openAttackRoll(attack)}
                            />
                          </div>
                          <p>{attack.damage}{attack.damage_bonus !== 0 ? modifier(attack.damage_bonus) : ''}</p>
                        </div>
                      </div>
                      <Show when={attack.tags && Object.keys(attack.tags).length > 0}>
                        <div class="weapon-tags">
                          <For each={Object.entries(attack.tags)}>
                            {([, value]) =>
                              <p class="tag">{value}</p>
                            }
                          </For>
                        </div>
                      </Show>
                    </div>
                  }
                </For>
              </div>
              <h2 class="weapon-title">{localize(TRANSLATION, locale()).support}</h2>
              <p class="text-xs md:text-sm">{companion().support}</p>
            </div>
            <div class="blockable py-4 mb-2">
              <div class="grid grid-cols-3 gap-2">
                <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.name, locale())])}>
                  {([slug, ability]) =>
                    <div class="flex flex-col items-center">
                      <p class="companion-ability-title">{ability}</p>
                      <p class="companion-ability-dice">
                        <Dice
                          text={modifier(companion().abilities[slug])}
                          onClick={() => props.openD20Test(`/check attr ${slug}`, ability, companion().abilities[slug])}
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
                      onClick={() => props.openD20Test(`/check save ${slug}`, localize(savingName.name, locale()), companion().saving_throws_value[slug])}
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
                          onClick={() => props.openD20Test(`/check skill "${skill.slug}"`, localize(config.skills[skill.slug].name, locale()), skill.modifier)}
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
