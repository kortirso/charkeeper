import { createSignal, createEffect, createMemo, Show, For, batch } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper, EditWrapper, Checkbox } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    desc: 'While in Beastform, you cannot use weapons or cast spells from Domain Cards. You can still use class features, abilities, and Beastform-specific actions.',
    examples: 'Examples: ',
    adv: 'Advantages: ',
    naturalForm: 'Natural form',
    transformation: 'Transformation to beast',
    beast: 'Select base beastform',
    hybridBeasts: 'Select base beastforms for hybrid'
  },
  ru: {
    desc: 'Во время трансформации вы не можете использовать оружие или заклинания из карт домена, но вы по-прежнему можете использовать другие функции или способности, к которым у вас есть доступ.',
    examples: 'Примеры:',
    adv: 'Преимущества: ',
    naturalForm: 'Естественная форма',
    transformation: 'Превращение в зверя',
    beast: 'Выберите базовую форму зверя',
    hybridBeasts: 'Выберите базовые формы для гибрида'
  },
  es: {
    desc: 'While in Beastform, you cannot use weapons or cast spells from Domain Cards. You can still use class features, abilities, and Beastform-specific actions.',
    examples: 'Examples: ',
    adv: 'Advantages: ',
    naturalForm: 'Forma natural',
    transformation: 'Transformación a bestia',
    beast: 'Select base beastform',
    hybridBeasts: 'Select base beastforms for hybrid'
  }
}

export const DaggerheartBeastform = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [beastform, setBeastform] = createSignal(undefined);
  const [beast, setBeast] = createSignal(undefined);
  const [hybrid, setHybrid] = createSignal({}); // form value
  const [currentHybrid, setCurrentHybrid] = createSignal({}); // database value

  const [editMode, setEditMode] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setBeastform(character().beastform);
      setBeast(character().beast);
      setHybrid(character().hybrid);
      setCurrentHybrid(character().hybrid);
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setEditMode(false);
      setHybrid({ ...currentHybrid() });
    });
  }

  const currentBaseBeast = createMemo(() => {
    if (config.beastforms[beast()]) return config.beastforms[beast()];
    if (config.beastforms[beastform()]) return config.beastforms[beastform()];

    return null;
  });

  const beastSelectOptions = createMemo(() => {
    let tier;

    switch (beastform()) {
      case 'legendary_beast':
        tier = 1;
        break;
      case 'mythic_beast':
      case 'legendary_hybrid':
        tier = 2;
        break;
      case 'mythic_hybrid':
        tier = 3;
        break;
      default:
        tier = 0;
    }

    return Object.fromEntries(Object.entries(config.beastforms).filter(([, values]) => values.tier <= tier && values.adv).map(([key, values]) => [key, `${localize(values.name, locale())} T${values.tier}`]));
  })

  const beastformsSelect = createMemo(() => {
    let result = Object.entries(config.beastforms).filter(([, values]) => values.tier <= character().tier).map(([key, values]) => [key, `${localize(values.name, locale())} T${values.tier}`]);

    return Object.fromEntries([['none', localize(TRANSLATION, locale()).naturalForm]].concat(result));
  });

  const changeBeastform = async (value) => {
    updateCharacter({ beastform: (value === 'none' ? null : value), beast: null, hybrid: {} });
    batch(() => {
      setBeastform(value === 'none' ? null : value);
      setBeast(null);
      setHybrid({});
      setCurrentHybrid({});
    });
  }

  const changeBeast = async (value) => {
    updateCharacter({ beast: value, hybrid: {} });
    batch(() => {
      setBeast(value);
      setHybrid({});
      setCurrentHybrid({});
    });
  }

  const changeHybrid = (value) => {
    let newValue;

    if (Object.keys(currentHybrid()).includes(value)) {
      const { [value]: unused, ...leftValue } = currentHybrid();
      console.log(unused)
      newValue = leftValue
    } else {
      newValue = { ...currentHybrid(), [value]: { adv: [], features: [] } }
    }
    if (Object.keys(newValue).length > 3) return;

    updateCharacter({ hybrid: newValue });
    setHybrid(newValue);
    setCurrentHybrid(newValue);
  }

  const changeHybridAdvantage = (slug, advantage) => {
    let newValue;

    const changedHybrid = hybrid()[slug];
    if (changedHybrid.adv.includes(advantage)) {
      newValue = changedHybrid.adv.filter((item) => item !== advantage);
    } else {
      newValue = changedHybrid.adv.concat([advantage]);
    }

    setHybrid({ ...hybrid(), [slug]: { ...changedHybrid, adv: newValue } });
  }

  const saveHybrid = () => {
    updateCharacter({ hybrid: hybrid() });
    batch(() => {
      setEditMode(false);
      setCurrentHybrid({ ...hybrid() });
    });
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBeastform' }}>
      <GuideWrapper character={character()}>
        <EditWrapper
          hidden={Object.keys(currentHybrid()).length === 0}
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={saveHybrid}
        >
          <div class="blockable p-4">
            <h2 class="text-lg">{localize(TRANSLATION, locale()).transformation}</h2>
            <Select
              containerClassList="w-full mt-2"
              items={beastformsSelect()}
              selectedValue={beastform() === null ? 'none' : beastform()}
              onSelect={changeBeastform}
            />
            <Show when={beastform()}>
              <Show when={beastform() === 'legendary_beast' || beastform() === 'mythic_beast'}>
                <Select
                  containerClassList="w-full mt-2"
                  labelText={localize(TRANSLATION, locale()).beast}
                  items={beastSelectOptions()}
                  selectedValue={beast() === null ? 'none' : beast()}
                  onSelect={changeBeast}
                />
              </Show>



              <Show when={beastform() === 'legendary_hybrid' || beastform() === 'mythic_hybrid'}>
                <Show
                  when={editMode()}
                  fallback={
                    <Select
                      multi
                      containerClassList="w-full mt-2"
                      labelText={localize(TRANSLATION, locale()).hybridBeasts}
                      items={beastSelectOptions()}
                      selectedValues={Object.keys(currentHybrid())}
                      onSelect={changeHybrid}
                    />
                  }
                >
                  <div class="mt-4 mb-2">
                    <div class="flex items-center">
                      <For each={Object.keys(hybrid())}>
                        {(slug) =>
                          <p class="flex-1 text-sm text-center">{localize(config.beastforms[slug].name, locale())}</p>
                        }
                      </For>
                    </div>
                    <div class="flex items-center">
                      <For each={Object.entries(hybrid())}>
                        {([slug, values]) =>
                          <div class="flex-1">
                            <For each={config.beastforms[slug].advantages}>
                              {(advantage) =>
                                <Checkbox
                                  filled
                                  labelText={localize(config.advantages[advantage], locale())}
                                  labelClassList="ml-2"
                                  labelPosition="right"
                                  checked={values.adv.includes(advantage)}
                                  classList="mt-1"
                                  onToggle={() => changeHybridAdvantage(slug, advantage)}
                                />
                              }
                            </For>
                          </div>
                        }
                      </For>
                    </div>
                  </div>
                </Show>
              </Show>



              <p class="text-sm mt-2">{localize(TRANSLATION, locale())['desc']}</p>
              <Show when={currentBaseBeast()}>
                <Show when={currentBaseBeast().examples}>
                  <p class="mt-1">{localize(TRANSLATION, locale()).examples} {localize(currentBaseBeast().examples, locale())}</p>
                </Show>
                <Show
                  when={currentBaseBeast().advantages}
                  fallback={
                    <Show when={Object.keys(currentHybrid()).length > 0}>
                      <p class="mt-1">
                        {localize(TRANSLATION, locale()).adv}
                        <span>
                          {Object.values(currentHybrid()).map((item) => item.adv).flat().map((item) => localize(config.advantages[item], locale())).join(', ')}
                        </span>
                      </p>
                    </Show>
                  }
                >
                  <p class="mt-1">{localize(TRANSLATION, locale()).adv} {currentBaseBeast().advantages.map((item) => localize(config.advantages[item], locale())).join(', ')}</p>
                </Show>
              </Show>
            </Show>
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
