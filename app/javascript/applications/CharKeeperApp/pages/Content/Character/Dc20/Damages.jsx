import { createEffect, createSignal, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, GuideWrapper, EditWrapper, Input, Select, Text, Button } from '../../../../components';
import config from '../../../../data/dc20.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Damage impact',
    immune: 'Immunity',
    vulner: 'Vulner',
    resist: 'Resist',
    nothing: 'Character does not have any resistances or vulnerabilities',
    damageCalculator: 'Damage calculator',
    damageValue: 'Income damage',
    damageType: 'Damage type',
    damageResult: 'Result',
    half: 'Half',
    double: 'Double',
    impacts: {
      immune: 'Immune',
      resist: 'Resistance',
      vulner: 'Vulnerability'
    },
    manual: 'Manual values'
  },
  ru: {
    title: 'Воздействие урона',
    immune: 'Иммунитет',
    vulner: 'Уязвим',
    resist: 'Сопр',
    nothing: 'У персонажа нет сопротивлений или уязвимостей',
    damageCalculator: 'Калькулятор урона',
    damageValue: 'Входящий урон',
    damageType: 'Тип урона',
    damageResult: 'Результат',
    half: 'Половина',
    double: 'Двойной',
    impacts: {
      immune: 'Иммунитет',
      resist: 'Сопротивление',
      vulner: 'Уязвимость'
    },
    manual: 'Персональные значения'
  }
}

export const Dc20Damages = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [damageValue, setDamageValue] = createSignal(0);
  const [damageType, setDamageType] = createSignal(null);
  const [resistances, setResistances] = createSignal([]);

  const [impact, setImpact] = createSignal(null);
  const [impactType, setImpactType] = createSignal(null);
  const [impactValue, setImpactValue] = createSignal('1');

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setResistances(character().resistances);
      setEditMode(false);
      setLastActiveCharacterId(character().id);
    });
  });

  const availableDamageTypes = createMemo(() => {
    const current = Object.keys(character().damages);

    return Object.fromEntries(
      Object.entries(config.damages).filter(([key]) => current.includes(key)).map(([key, values]) => [key, values.name[locale()]])
    );
  });

  const impactTypes = createMemo(() => {
    return Object.fromEntries(
      Object.entries({ ...config.damages, ...config.damageGroups }).map(([key, values]) => [key, values.name[locale()]])
    );
  });

  const impactValues = createMemo(() => {
    if (!impact() || impact() === 'immune') return {};

    const result = { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10 };
    let addition;
    if (impact() === 'resist') addition = { 'half': localize(TRANSLATION, locale()).half };
    if (impact() === 'vulner') addition = { 'double': localize(TRANSLATION, locale()).double };

    return { ...result, ...addition };
  })

  const damageResult = createMemo(() => {
    if (damageValue() <= 0) return 0;
    if (damageType() === null) return 0;

    const current = character().damages[damageType()];
    if (current.immune) return 0;
    if (current.abs > 0 && current.multi > 0) return damageValue() / 2;
    if (current.abs < 0 && current.multi < 0) return damageValue() * 2;

    let result = damageValue() + current.abs;
    if (current.multi > 0) {
      result = Math.round(result / 2);
      if (current.abs === 0 && result === damageValue()) result -= 1;
    } else if (current.multi < 0) result *= 2;

    return result;
  });

  const cancelEditing = () => {
    batch(() => {
      setResistances(character().resistances);
      setEditMode(false);
    });
  }

  const damageText = (values) => {
    if (values.abs > 0 && values.multi > 0) return `${localize(TRANSLATION, locale()).resist} (${localize(TRANSLATION, locale()).half})`;
    if (values.abs < 0 && values.multi < 0) return `${localize(TRANSLATION, locale()).vulner} (${localize(TRANSLATION, locale()).double})`;

    const result = [];
    if (values.abs !== 0) {
      const text = values.abs > 0 ? localize(TRANSLATION, locale()).resist : localize(TRANSLATION, locale()).vulner;
      result.push(`${text} (${Math.abs(values.abs)})`)
    }
    if (values.multi !== 0) {
      const text = values.multi > 0 ? localize(TRANSLATION, locale()).resist : localize(TRANSLATION, locale()).vulner;
      result.push(`${text} (${values.multi > 0 ? localize(TRANSLATION, locale()).half : localize(TRANSLATION, locale()).double})`)
    }
    return result.join(' / ');
  }

  const addImpact = () => {
    if (!impact() || !impactType()) return;
    if (impact() === 'immune') return setResistances(resistances().concat([[impactType(), 'immune']]));
    if (!impactValue()) return;

    setResistances(resistances().concat([[impactType(), impact(), impactValue()]]));
  }

  const removeImpact = (index) => {
    const result = [
      ...resistances().slice(0, index),
      ...resistances().slice(index + 1)
    ];
    setResistances(result);
  }

  const updateResistances = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { resistances: resistances() } }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReloadCharacter();
        setEditMode(false);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Damages' }}>
      <GuideWrapper character={character()}>
        <EditWrapper
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateResistances}
        >
          <div class="blockable p-4">
            <p class="text-lg">{localize(TRANSLATION, locale()).title}</p>
            <Show
              when={!editMode()}
              fallback={
                <div class="mt-2">
                  <p class="mb-2">{localize(TRANSLATION, locale()).manual}</p>
                  <For each={resistances()}>
                    {(impact, index) =>
                      <div class="flex items-center gap-x-4 mt-1">
                        <Button default size="small" onClick={() => removeImpact(index())}>
                          <Minus />
                        </Button>
                        <span>{config.damages[impact[0]] ? localize(config.damages[impact[0]].name, locale()) : localize(config.damageGroups[impact[0]].name, locale())}</span>
                        <span>{localize(TRANSLATION, locale()).impacts[impact[1]]}</span>
                        <Show when={impact[1] !== 'immune'}>
                          <Show
                            when={impact[2] !== 'half' && impact[2] !== 'double'}
                            fallback={
                              <span>({localize(TRANSLATION, locale())[impact[2]]})</span>
                            }
                          >
                            <span>({impact[2]})</span>
                          </Show>
                        </Show>
                      </div>
                    }
                  </For>
                  <div class="flex items-center gap-x-4 mt-2">
                    <Select
                      containerClassList="flex-1"
                      labelText="Тип воздействия"
                      items={localize(TRANSLATION, locale()).impacts}
                      selectedValue={impact()}
                      onSelect={setImpact}
                    />
                    <Select
                      containerClassList="flex-1"
                      labelText="Тип урона"
                      items={impactTypes()}
                      selectedValue={impactType()}
                      onSelect={setImpactType}
                    />
                    <Show when={impact() && impact() !== 'immune'}>
                      <Select
                        containerClassList="flex-1"
                        labelText="Значение"
                        items={impactValues()}
                        selectedValue={impactValue()}
                        onSelect={setImpactValue}
                      />
                    </Show>
                    <Button default classList="mt-8" onClick={addImpact}><PlusSmall /></Button>
                  </div>
                </div>
              }
            >
              <Show
                when={Object.keys(character().damages).length > 0}
                fallback={<p class="mt-2">{localize(TRANSLATION, locale()).nothing}</p>}
              >
                <>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-2">
                    <For each={Object.entries(config.damages)}>
                      {([slug, values]) =>
                        <Show when={character().damages[slug]}>
                          <div class="flex items-center gap-x-4">
                            <span>{localize(values.name, locale())}</span>
                            <Show
                              when={character().damages[slug].immune}
                              fallback={<span>{damageText(character().damages[slug])}</span>}
                            >
                              <span>{localize(TRANSLATION, locale()).immune}</span>
                            </Show>
                          </div>
                        </Show>
                      }
                    </For>
                  </div>
                  <p class="mt-4">{localize(TRANSLATION, locale()).damageCalculator}</p>
                  <div class="mt-2 flex gap-2">
                    <Input
                      numeric
                      containerClassList="w-4/10 md:w-40"
                      labelText={localize(TRANSLATION, locale()).damageValue}
                      value={damageValue()}
                      onInput={(value) => setDamageValue(parseInt(value))}
                    />
                    <Select
                      containerClassList="w-6/10 md:w-40"
                      labelText={localize(TRANSLATION, locale()).damageType}
                      items={availableDamageTypes()}
                      selectedValue={damageType()}
                      onSelect={setDamageType}
                    />
                    <Text
                      containerClassList="w-20 ml-4 hidden md:block"
                      textClassList="h-12 leading-12 text-center text-lg"
                      labelText={localize(TRANSLATION, locale()).damageResult}
                      text={damageResult()}
                    />
                  </div>
                  <p class="mt-2 md:hidden text-sm">{localize(TRANSLATION, locale()).damageResult} - {damageResult()}</p>
                </>
              </Show>
            </Show>
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
