import { createEffect, createSignal, createMemo, For, Show, batch } from 'solid-js';

import { ErrorWrapper, GuideWrapper, EditWrapper, Input, Select, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Close } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Damage impact',
    impacts: {
      immune: 'Immunity',
      resistance: 'Resistance',
      weakness: 'Weakness'
    },
    impact: 'Impact',
    damages: {
      bludge: 'Bludgeoning',
      pierce: 'Piercing',
      slash: 'Slashing',
      acid: 'Acid',
      cold: 'Cold',
      electricity: 'Electricity',
      fire: 'Fire',
      sonic: 'Sonic',
      vitality: 'Vitality',
      void: 'Void',
      force: 'Force',
      spirit: 'Spirit',
      mental: 'Mental',
      poison: 'Poison',
      bleed: 'Bleed',
      precision: 'Precision'
    },
    impactType: 'Damage',
    impactValue: 'Value'
  },
  ru: {
    title: 'Воздействие урона',
    impacts: {
      immune: 'Иммунитет',
      resistance: 'Устойчивость',
      weakness: 'Уязвимость'
    },
    impact: 'Воздействие',
    damages: {
      bludge: 'Дробящий',
      pierce: 'Колющий',
      slash: 'Режущий',
      acid: 'Кислота',
      cold: 'Холод',
      electricity: 'Электричество',
      fire: 'Огонь',
      sonic: 'Звук',
      vitality: 'Жизнь',
      void: 'Пустота',
      force: 'Сила',
      spirit: 'Дух',
      mental: 'Ментальный урон',
      poison: 'Яд',
      bleed: 'Кровотечение',
      precision: 'Точность'
    },
    impactType: 'Урон',
    impactValue: 'Значение'
  },
  es: {
    title: 'Impacto de daño',
    impacts: {
      immune: 'Inmunidad',
      resistance: 'Resistencia',
      weakness: 'Debilidad'
    },
    impact: 'Impacto',
    damages: {
      bludge: 'Contundente',
      pierce: 'Perforante',
      slash: 'Cortante',
      acid: 'Ácido',
      cold: 'Frio',
      electricity: 'Eléctrico',
      fire: 'Fuego',
      sonic: 'Sónico',
      vitality: 'Vitalidad',
      void: 'Vacío',
      force: 'Fuerza',
      spirit: 'Espíritu',
      mental: 'Mental',
      poison: 'Veneno',
      bleed: 'Sangrado',
      precision: 'Precisión'
    },
    impactType: 'Daño',
    impactValue: 'Valor'
  }
}

export const Pathfinder2Damages = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);

  const [reduction, setReduction] = createSignal({});
  const [totalReduction, setTotalReduction] = createSignal({});

  const [impact, setImpact] = createSignal(null);
  const [impactType, setImpactType] = createSignal(null);
  const [impactValue, setImpactValue] = createSignal(1);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setReduction(character().damage_reduction);
      setTotalReduction(character().total_damage_reduction);
      setEditMode(false);
      setLastActiveCharacterId(character().id);
    });
  });

  const cancelEditing = () => {
    batch(() => {
      setEditMode(false);
      setReduction(character().damage_reduction);
    });
  }

  const impactTypes = createMemo(() => {
    if (!impact()) return {};

    const existingImpactTypes = Object.keys(reduction()[impact()]);
    return Object.fromEntries(Object.entries(localize(TRANSLATION, locale()).damages).filter(([key,]) => !existingImpactTypes.includes(key)));
  });

  const changeImpact = (value) => {
    batch(() => {
      setImpact(value);
      setImpactType(null);
      setImpactValue(1);
    });
  }

  const addImpact = () => {
    if (!impact() || !impactType()) return;
    if (impact() !== 'immune' && !impactValue()) return;

    setReduction({ ...reduction(), [impact()]: { ...reduction()[impact()], [impactType()]: impactValue() } });
    changeImpact(null);
  }

  const removeReduction = (impact, type) => {
    setReduction({
      ...reduction(),
      [impact]: Object.fromEntries(Object.entries(reduction()[impact]).filter(([key,]) => key !== type))
    });
  }

  const updateResistances = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { damage_reduction: reduction() } }
    );
    performResponse(
      result,
      function() {
        setTotalReduction(result.character.total_damage_reduction);
        setEditMode(false);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const renderReduction = (type, values) => {
    const result = [];
    if (values.immune) result.push(localize(TRANSLATION, locale()).impacts.immune);
    if (values.weakness) result.push(`${localize(TRANSLATION, locale()).impacts.weakness} ${values.weakness}`);
    if (values.resistance) result.push(`${localize(TRANSLATION, locale()).impacts.resistance} ${values.resistance}`);

    return `${localize(TRANSLATION, locale()).damages[type]} - ${result.join(', ')}`;
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Damages' }}>
      <GuideWrapper character={character()}>
        <EditWrapper
          position="right"
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={updateResistances}
        >
          <div class="blockable p-4">
            <p class="text-lg">{localize(TRANSLATION, locale()).title}</p>
            <Show
              when={editMode()}
              fallback={
                <div class="flex flex-col gap-2 mt-2">
                  <For each={Object.entries(totalReduction())}>
                    {([type, values]) =>
                      <p>{renderReduction(type, values)}</p>
                    }
                  </For>
                </div>
              }
            >
              <>
                <div class="flex flex-col gap-2 mt-2">
                  <For each={Object.entries(reduction())}>
                    {([impact, values]) =>
                      <For each={Object.entries(values)}>
                        {([type, value]) =>
                          <div class="flex items-center gap-4">
                            <Button default size="small" classList="opacity-75" onClick={() => removeReduction(impact, type)}>
                              <Close />
                            </Button>
                            <p>
                              {localize(TRANSLATION, locale()).impacts[impact]} {localize(TRANSLATION, locale()).damages[type]}
                              <Show when={impact !== 'immune'}>
                                {` ${value}`}
                              </Show>
                            </p>
                          </div>
                        }
                      </For>
                    }
                  </For>
                </div>
                <div class="flex flex-col md:flex-row items-start md:items-center gap-2 mt-2">
                  <Select
                    containerClassList="flex-1 w-full"
                    labelText={localize(TRANSLATION, locale()).impact}
                    items={localize(TRANSLATION, locale()).impacts}
                    selectedValue={impact()}
                    onSelect={changeImpact}
                  />
                  <Select
                    containerClassList="flex-1 w-full"
                    labelText={localize(TRANSLATION, locale()).impactType}
                    items={impactTypes()}
                    selectedValue={impactType()}
                    onSelect={setImpactType}
                  />
                  <div class="flex justify-start items-end gap-2 flex-1 w-full">
                    <Show when={impact() && impact() !== 'immune'}>
                      <Input
                        numeric
                        containerClassList="flex-1 w-full"
                        labelText={localize(TRANSLATION, locale()).impactValue}
                        value={impactValue()}
                        onInput={setImpactValue}
                      />
                    </Show>
                    <Button default classList="md:mt-8" onClick={addImpact}><PlusSmall /></Button>
                  </div>
                </div>
              </>
            </Show>
          </div>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
