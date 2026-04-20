import { createMemo, Show, For } from 'solid-js';

import { Button, Dice } from '../../components';
import { useAppLocale, useAppAlert, useAppState } from '../../context';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';
import { PlusSmall, Minus, Campfire, LongCampfire, Moon, Picnic, Combat, Ability, Spell, Grimoire } from '../../assets';
import { localize, performResponse } from '../../helpers';

const FEATURE_ICONS = {
  'one_at_short_rest': Picnic, 'short_rest': Campfire, 'long_rest': LongCampfire, 'session': Moon, 'combat': Combat
}
const TYPE_ICONS = { 'ability': Ability, 'spell': Spell, 'grimoire': Grimoire }
const TRANSLATION = {
  en: {
    one_at_short_rest: 'Short - 1, long - full',
    short_rest: 'Short rest',
    long_rest: 'Long rest',
    session: 'Session rest',
    combat: 'Combat rest',
    ap: 'AP',
    sp: 'SP',
    mp: 'MP',
    hope: 'Hope',
    stress: 'Stress',
    spent: 'Resource is spent'
  },
  ru: {
    one_at_short_rest: 'Короткий - 1, длинный - все',
    short_rest: 'Короткий отдых',
    long_rest: 'Длинный отдых',
    session: 'Между сессиями',
    combat: 'Между боями',
    ap: 'ОД',
    sp: 'ОВ',
    mp: 'ОМ',
    hope: 'Надежда',
    stress: 'Стресс',
    spent: 'Ресурс потрачен'
  },
  es: {
    one_at_short_rest: 'Corto - 1, largo - todo',
    short_rest: 'Descanso corto',
    long_rest: 'Descanso largo',
    session: 'Descanso entre sesiones',
    combat: 'Descanso entre batallas',
    ap: 'PA',
    sp: 'PE',
    mp: 'PM',
    hope: 'Esperanza',
    stress: 'Estrés',
    spent: 'Resource is spent'
  }
}
const SPENDING_RESOURCES_PROVIDERS = ['daggerheart'];

export const FeatureTitle = (props) => {
  const character = () => props.character;
  const feature = () => props.feature;

  const IconComponent = FEATURE_ICONS[feature().limit_refresh]; // eslint-disable-line solid/reactivity
  const InfoComponent = character().provider === 'daggerheart' ? TYPE_ICONS[feature().info.type] : null; // eslint-disable-line solid/reactivity

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale] = useAppLocale();

  const daggerheartResource = () => {
    return {
      hope: { free: character().hope_marked, attribute: 'hope_marked', modifier: -1 },
      stress: { free: character().stress_max - character().stress_marked, attribute: 'stress_marked', modifier: 1 }
    }
  }

  const resources = createMemo(() => {
    if (character().provider === 'daggerheart') return daggerheartResource();

    return {};
  });

  const enoughResources = createMemo(() => {
    if (Object.keys(resources()).length === 0) return false;

    return Object.entries(feature().price).filter(([slug, value]) => resources()[slug].free < value).length === 0;
  });

  const spendResources = async (e) => {
    e.stopPropagation();

    const payload = Object.entries(feature().price).reduce((acc, [slug, value]) => {
      acc[resources()[slug].attribute] = character()[resources()[slug].attribute] + value * resources()[slug].modifier;
      return acc;
    }, {});

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(payload);
        renderNotice(localize(TRANSLATION, locale()).spent);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <div class="flex">
      <div class="flex-1">
        <p class="flex items-center">
          <Show when={InfoComponent}>
            <span class="mr-2"><InfoComponent /></span>
          </Show>
          {feature().title}
        </p>
        <div class="flex items-center gap-x-4">
          <Show when={character().provider === 'daggerheart' && (feature().info.hope_dice || feature().info.fear_dice)}>
            <Show when={feature().info.hope_dice}>
              <Dice width="24" height="24" textClassList="text-sm!" mode="hope" text={feature().info.hope_dice} />
            </Show>
            <Show when={feature().info.fear_dice}>
              <Dice width="24" height="24" textClassList="text-sm!" mode="fear" text={feature().info.fear_dice} />
            </Show>
          </Show>
          <Show when={Object.keys(feature().price).length > 0}>
            <Show
              when={SPENDING_RESOURCES_PROVIDERS.includes(character().provider)}
              fallback={
                <div class="flex gap-x-2">
                  <For each={Object.entries(feature().price)}>
                    {([slug, value]) =>
                      <Show when={localize(TRANSLATION, locale())[slug]}>
                        <p class="text-xs">{localize(TRANSLATION, locale())[slug]} {value}</p>
                      </Show>
                    }
                  </For>
                </div>
              }
            >
              <div
                class="resource"
                classList={{ 'enough': enoughResources() }}
                onClick={(e) => enoughResources() ? spendResources(e) : null}
              >
                <For each={Object.entries(feature().price)}>
                  {([slug, value]) =>
                    <Show when={localize(TRANSLATION, locale())[slug]}>
                      <p class="text-xs">{localize(TRANSLATION, locale())[slug]} {value}</p>
                    </Show>
                  }
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </div>
      <div class="flex items-center gap-x-4">
        <Show when={feature().limit !== undefined}>
          <div class="flex items-center">
            <Button default size="small" onClick={(event) => (feature().limit === 0 && feature().used_count !== 0) || feature().used_count !== feature().limit ? props.onSpendEnergy(event, feature()) : event.stopPropagation()}>
              <Minus />
            </Button>
            <p class="flex items-center justify-center mx-2">
              <span class="w-6 text-center">{feature().limit === 0 ? -feature().used_count : feature().limit - (feature().used_count === null ? feature().limit : feature().used_count)}</span>
              <Show when={IconComponent}>
                <span title={localize(TRANSLATION, locale())[feature().limit_refresh]}><IconComponent /></span>
              </Show>
            </p>
            <Button default size="small" onClick={(event) => feature().limit === 0 || feature().used_count === null || feature().used_count > 0 ? props.onRestoreEnergy(event, feature()) : event.stopPropagation()}>
              <PlusSmall />
            </Button>
          </div>
        </Show>
      </div>
    </div>
  );
}
