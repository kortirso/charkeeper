import { createMemo, Show, For } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    title: 'Resources',
    health: 'Health points',
    stamina_points: 'Stamina points',
    mana_points: 'Mana points',
    rest_points: 'Rest points',
    grit_points: 'Grit points',
    temp: {
      health: 'Temp HP',
    },
    healthy: 'Healthy',
    bloodied: 'Bloodied',
    wellBloodied: 'Well-Bloodied',
    door: "Death's Door",
    dead: 'Dead',
    environment: 'Secondary',
    speedTitle: 'Speed',
    speeds: {
      ground: 'Ground',
      swim: 'Swim',
      climb: 'Climb',
      flight: 'Flight',
      glide: 'Glide'
    },
    jump: 'Jump distance',
    breath: 'Breath duration',
    vision: 'Senses',
    visions: {
      dark: 'Darkvision',
      blind: 'Blindsight',
      true: 'Truesight',
      tremor: 'Tremorsense'
    }
  },
  ru: {
    title: 'Ресурсы',
    health: 'Очки здоровья',
    stamina_points: 'Очки выносливости',
    mana_points: 'Очки маны',
    rest_points: 'Очки отдыха',
    grit_points: 'Очки решимости',
    temp: {
      health: 'Временные ОЗ',
    },
    healthy: 'Здоров',
    bloodied: 'Изранен',
    wellBloodied: 'Тяжело изранен',
    door: 'При смерти',
    dead: 'Мёртв',
    environment: 'Вторичные',
    speedTitle: 'Скорость',
    speeds: {
      ground: 'Наземная',
      swim: 'Плавание',
      climb: 'Лазание',
      flight: 'Полёт',
      glide: 'Планирование'
    },
    jump: 'Дальность прыжка',
    breath: 'Запас дыхания',
    vision: 'Чувства',
    visions: {
      dark: 'Тёмное зрение',
      blind: 'Слепое зрение',
      true: 'Истинное зрение',
      tremor: 'Чувство вибрации'
    }
  },
  es: {
    title: 'Recursos',
    health: 'Puntos de salud',
    stamina_points: 'Puntos de estamina',
    mana_points: 'Puntos de maná',
    rest_points: 'Puntos de descanso',
    grit_points: 'Puntos de temple',
    temp: {
      health: 'Temp HP',
    },
    healthy: 'Saludable',
    bloodied: 'Sangrando',
    wellBloodied: 'Desangrado',
    door: 'A punto de morir',
    dead: 'Muerto',
    environment: 'Secondary',
    speedTitle: 'Velocidad',
    speeds: {
      ground: 'Terrestre',
      swim: 'Nado',
      climb: 'Trepar',
      flight: 'Vuelo',
      glide: 'Planeo'
    },
    jump: 'Distancia de salto',
    breath: 'Duración de la respiración',
    vision: 'Senses',
    visions: {
      dark: 'Darkvision',
      blind: 'Blindsight',
      true: 'Truesight',
      tremor: 'Tremorsense'
    }
  }
}

export const Dc20Resources = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const healthStatus = createMemo(() => {
    const totalHealth = character().health.current + character().health.temp;

    if (totalHealth > character().health.bloodied) return localize(TRANSLATION, locale()).healthy;
    if (totalHealth > character().health.well_bloodied) return localize(TRANSLATION, locale()).bloodied;
    if (totalHealth > 0) return localize(TRANSLATION, locale()).wellBloodied;
    if (totalHealth > character().health.death_threshold) return localize(TRANSLATION, locale()).door;

    return localize(TRANSLATION, locale()).dead;
  });

  const updateTempResource = (attribute) => {
    const payload = { current: character()[attribute].current, temp: character()[attribute].temp + 1 };
    updateCharacter(attribute, payload);
  }

  const updateHealth = async (value) => {
    const totalHealth = character().health.current + character().health.temp;

    if (totalHealth === character().health.death_threshold && value === -1) return;
    if (character().health.current === character().health.max && value === 1) return;

    let payload = { current: character().health.current, temp: character().health.temp };
    if (value === 1) payload = { ...payload, current: payload.current + 1 }
    else {
      if (payload.temp > 0) payload = { ...payload, temp: payload.temp - 1 };
      else payload = { ...payload, current: payload.current - 1 };
    }
    updateCharacter('health', payload);
  }

  const updateResource = (attribute, value) => {
    if (attribute === 'health') return updateHealth(value);

    if (character()[attribute].current === 0 && value === -1) return;
    if (character()[attribute].current === character()[attribute].max && value === 1) return;

    const payload = { current: character()[attribute].current + value };
    updateCharacter(attribute, payload);
  }

  const updateCharacter = async (attribute, payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: { [attribute]: payload }, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter({ [attribute]: { ...character()[attribute], ...payload } });
    else renderAlerts(result.errors_list);
  }

  const renderAttribute = (points, slug) => (
    <Show when={points.max !== 0} fallback={<></>}>
      <div class="flex items-center">
        <p class="text-sm/4 flex-1">
          {localize(TRANSLATION, locale())[slug]}
          <Show when={slug === 'health'}>
            <span class="text-sm"> ({healthStatus()})</span>
          </Show>
        </p>
        <div class="flex items-center flex-1">
          <Button default size="small" onClick={() => updateResource(slug, -1)}>
            <Minus />
          </Button>
          <p class="w-32 text-center">
            {points.current} / {points.max}
          </p>
          <Button default size="small" onClick={() => updateResource(slug, 1)}>
            <PlusSmall />
          </Button>
        </div>
      </div>
      <Show when={points.temp !== undefined}>
        <div class="flex items-center">
          <p class="text-sm/4 flex-1">{localize(TRANSLATION, locale()).temp[slug]}</p>
          <div class="flex items-center flex-1">
            <div class="w-6" />
            <p class="w-32 text-center">
              {points.temp}
            </p>
            <Button default size="small" onClick={() => updateTempResource(slug)}>
              <PlusSmall />
            </Button>
          </div>
        </div>
      </Show>
    </Show>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20Resources' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block mb-4">
          <div class="mb-4 flex flex-col gap-1">
            <h2 class="text-lg font-normal!">{localize(TRANSLATION, locale()).title}</h2>
            {renderAttribute(character().health, 'health')}
            {renderAttribute(character().stamina_points, 'stamina_points')}
            {renderAttribute(character().mana_points, 'mana_points')}
            {renderAttribute(character().rest_points, 'rest_points')}
            {renderAttribute(character().grit_points, 'grit_points')}
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2">
            <div class="flex flex-col gap-1 md:gap-2">
              <h3 class="font-normal!">{localize(TRANSLATION, locale()).speedTitle}</h3>
              <p class="text-sm">{localize(TRANSLATION, locale()).speeds.ground} - {character().speeds.ground}</p>
              <For each={Object.entries(character().speeds).filter(([slug,]) => slug !== 'ground')}>
                {([slug, value]) =>
                  <p class="text-sm">{localize(TRANSLATION, locale()).speeds[slug]} - {value}</p>
                }
              </For>
            </div>
            <div class="flex flex-col gap-1 md:gap-2">
              <h3 class="font-normal!">{localize(TRANSLATION, locale()).environment}</h3>
              <p class="text-sm">{localize(TRANSLATION, locale()).jump} - {character().jump}</p>
              <p class="text-sm">{localize(TRANSLATION, locale()).breath} - {character().breath}</p>
            </div>
            <Show
              when={Object.values(character().visions).filter((item) => item > 0).length > 0}
            >
              <div class="flex flex-col gap-1 md:gap-2">
                <h3 class="font-normal!">{localize(TRANSLATION, locale()).vision}</h3>
                <For each={Object.entries(character().visions).filter(([, value]) => value > 0)}>
                  {([slug, value]) =>
                    <p class="text-sm">{localize(TRANSLATION, locale()).visions[slug]} - {value}</p>
                  }
                </For>
              </div>
            </Show>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
