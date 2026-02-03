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
      health: 'Temp health points',
    },
    healthy: 'Healthy',
    bloodied: 'Bloodied',
    wellBloodied: 'Well-Bloodied',
    door: "Death's Door",
    dead: 'Dead',
    environment: 'Environment',
    speedTitle: 'Speed',
    speeds: {
      ground: 'Ground',
      swim: 'Swim',
      climb: 'Climb',
      flight: 'Flight',
      glide: 'Glide'
    },
    jump: 'Jump distance',
    breath: 'Breath duration'
  },
  ru: {
    title: 'Ресурсы',
    health: 'Очки здоровья',
    stamina_points: 'Очки выносливости',
    mana_points: 'Очки маны',
    rest_points: 'Очки отдыха',
    grit_points: 'Очки решимости',
    temp: {
      health: 'Временные очки здоровья',
    },
    healthy: 'Здоров',
    bloodied: 'Изранен',
    wellBloodied: 'Тяжело изранен',
    door: 'При смерти',
    dead: 'Мёртв',
    environment: 'Обстановка',
    speedTitle: 'Скорость',
    speeds: {
      ground: 'Наземная',
      swim: 'Плавание',
      climb: 'Лазание',
      flight: 'Полёт',
      glide: 'Планирование'
    },
    jump: 'Дальность прыжка',
    breath: 'Запас дыхания'
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
      <div class="flex items-center mb-2 dark:text-snow">
        <p class="text-sm/4 w-56">{localize(TRANSLATION, locale())[slug]}</p>
        <div class="flex items-center">
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
        <div class="flex items-center mb-2">
          <p class="text-sm/4 w-56">{localize(TRANSLATION, locale()).temp[slug]}</p>
          <div class="flex items-center">
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
        <div class="blockable p-4 mb-2 grid grid-cols-1 emd:grid-cols-3 gap-x-2 gap-y-4">
          <div class="col-span-2">
            <h2 class="text-lg font-normal! mb-2">{localize(TRANSLATION, locale())['title']}</h2>
            <div class="flex mb-2">
              <p class="w-56" />
              <div class="flex">
                <div class="w-6" />
                <p class="w-32 text-center">{healthStatus()}</p>
                <div class="w-6" />
              </div>
            </div>
            {renderAttribute(character().health, 'health')}
            {renderAttribute(character().stamina_points, 'stamina_points')}
            {renderAttribute(character().mana_points, 'mana_points')}
            {renderAttribute(character().rest_points, 'rest_points')}
            {renderAttribute(character().grit_points, 'grit_points')}
          </div>
          <div class="">
            <h2 class="text-lg font-normal! mb-4">{localize(TRANSLATION, locale()).environment}</h2>
            <h3 class="font-normal! mb-2">{localize(TRANSLATION, locale()).speedTitle}</h3>
            <p class="text-sm mb-2">{localize(TRANSLATION, locale()).speeds.ground} - {character().speeds.ground}</p>
            <For each={Object.entries(character().speeds).filter(([slug,]) => slug !== 'ground')}>
              {([slug, value]) =>
                <p class="text-sm mb-2">{localize(TRANSLATION, locale()).speeds[slug]} - {value}</p>
              }
            </For>
            <p class="text-sm mt-4">{localize(TRANSLATION, locale()).jump} - {character().jump}</p>
            <p class="text-sm mt-4">{localize(TRANSLATION, locale()).breath} - {character().breath}</p>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
