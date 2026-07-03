import { createSignal, createEffect, createMemo, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { Key } from '@solid-primitives/keyed';

import {
  Toggle, Button, Select, ErrorWrapper, FeatureTitle, TextArea, CharacterNavigation, Checkbox, GuideWrapper
} from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Edit, PlusSmall, Minus } from '../../assets';
import { updateCharacterFeatRequest } from '../../requests/updateCharacterFeatRequest';
import { readFromCache, writeToCache, localize, translate } from '../../helpers';

const FEATURES_FILTER_NAME = 'FeaturesFiltersStatus';
const CHARKEEPER_HOST_CACHE_NAME = 'CharKeeperHost';
const TRANSLATION = {
  en: {
    activeFeat: 'Active',
    allFeatures: 'All features',
    personalFeats: 'Personal feats can be created through homebrew',
    settings: 'Filter settings',
    showPersonal: 'Show personal',
    groupFeatures: 'Group features',
    showPassive: 'Show passive',
    expandAll: 'Expand all',
    dc20Range: 'Range',
    repeatable: 'Repeatable',
    prices: {
      ap: 'AP',
      sp: 'SP',
      'ap/sp': 'AP/SP'
    },
    here: 'here',
    tokens: 'Tokens'
  },
  ru: {
    activeFeat: 'Активен',
    allFeatures: 'Все способности',
    personalFeats: 'Личные способности могут быть добавлены через homebrew',
    settings: 'Настройки фильтров',
    showPersonal: 'Показать личные',
    groupFeatures: 'Группировать',
    showPassive: 'Показать пассивные',
    expandAll: 'Раскрывать все',
    dc20Range: 'Дальность',
    repeatable: 'Многократное',
    prices: {
      ap: 'ОД',
      sp: 'ОВ',
      'ap/sp': 'ОД/ОВ'
    },
    here: 'тут',
    tokens: 'Жетоны'
  },
  es: {
    activeFeat: 'Activo',
    allFeatures: 'Todas las habilidades',
    personalFeats: 'Las habilidades personales pueden ser agregadas a través de homebrew',
    settings: 'Configuración del filtro',
    showPersonal: 'Mostrar personales',
    groupFeatures: 'Agrupar características',
    showPassive: 'Mostrar pasivas',
    expandAll: 'Expandir todo',
    dc20Range: 'Rango',
    repeatable: 'Repetible',
    prices: {
      ap: 'PA',
      sp: 'PE',
      'ap/sp': 'PA/PE'
    },
    here: 'aquí',
    tokens: 'Tokens'
  }
}

export const Feats = (props) => {
  const character = () => props.character;
  const filters = () => props.filters;

  const [host, setHost] = createSignal('https://charkeeper.org/homebrews');
  const [showFilters, setShowFilters] = createSignal(false);
  const [filtering, setFiltering] = createSignal(undefined);
  const [activeFilter, setActiveFilter] = createSignal(filters()[0]?.title);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [featValues, setFeatValues] = createSignal(
    character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {})
  );

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const readFeaturesToggle = async () => {
    const cacheValue = await readFromCache(FEATURES_FILTER_NAME);
    setFiltering(cacheValue === null || cacheValue === undefined ? ['groupFeatures'] : cacheValue.split(','));
  }

  const readHost = async () => {
    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    const baseHost = cacheValue === null || cacheValue === undefined ? appState.rootHost : cacheValue;
    setHost(baseHost.includes('localhost') ? `http://${baseHost}/homebrews` : `https://${baseHost}/homebrews`);
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setFeatValues(character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {}));
      setLastActiveCharacterId(character().id);
      setActiveFilter(filters()[0]?.title);
    });

    readFeaturesToggle();
    readHost();
  });

  const activeFilterOptions = createMemo(() => filters().find((item) => item.title === activeFilter()));

  const filteredFeatures = createMemo(() => {
    if (filtering() === undefined) return character().features;

    const result = character().features.filter((item) => {
      if (!filtering().includes('showPassive') && item.kind === 'update_result') return false;
      return true;
    });

    return filtering().includes('groupFeatures') && activeFilterOptions() ? result.filter(activeFilterOptions().callback) : result;
  });

  const spendEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: feature.used_count + 1 });
  }

  const restoreEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: (feature.used_count === null ? feature.limit : feature.used_count) - 1 });
  }

  const updateFeatureValue = (feature, value) => {
    setFeatValues({ ...featValues(), [feature.slug]: value });
    refreshFeatures(feature.id, { value: value });
  }

  const updateMultiFeatureValue = (feature, value) => {
    const currentValues = featValues()[feature.slug];
    if (currentValues) {
      const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
      setFeatValues({ ...featValues(), [feature.slug]: newValue });
    } else {
      setFeatValues({ ...featValues(), [feature.slug]: [value] });
    }
    refreshFeatures(feature.id, { value: featValues()[feature.slug] });
  }

  const refreshFeatures = async (featureId, payload) => {
    const result = await updateCharacterFeatRequest(
      appState.accessToken, character().provider, character().id, featureId, { character_feat: payload }
    );

    if (result.errors_list === undefined) {
      props.onReloadCharacter();
    } else renderAlerts(result.errors_list);
  }

  const updateFiltering = (value) => {
    const newValue = filtering().includes(value) ? filtering().filter((item) => item !== value) : filtering().concat([value]);
    batch(() => {
      writeToCache(FEATURES_FILTER_NAME, newValue.join(','));
      setFiltering(newValue);
    })
  }

  const renderFeatPrice = (enhancement) => {
    const result = Object.entries(enhancement.price).map(([slug, price]) => {
      if (price === null) return `X ${localize(TRANSLATION, locale()).prices[slug]}`;

      return `${price} ${localize(TRANSLATION, locale()).prices[slug]}`;
    });

    if (enhancement.repeatable) result.push(localize(TRANSLATION, locale()).repeatable);

    return result.join(', ');
  }

  const renderFeatureOptions = (feature) => {
    if (props[feature.info.options_list]) return props[feature.info.options_list];
    if (!props.config[feature.info.options_list]) {
      if (feature.info.options_parent) {
        const items = feature.info.options_parent.split('.')
        return translate(props.config[items[0]][items[1]][feature.info.options_list], locale());
      } else {
        return {};
      }
    }

    return translate(props.config[feature.info.options_list], locale());
  }

  const findTokensMax = (tokensMax) => {
    if (tokensMax === 'none') return 1000;
    if (tokensMax === 'spellcast') {
      const numbers = character().spellcast_traits.map((trait) => character().modified_traits[trait] + character().spell_bonus);
      return Math.max(...numbers, 1);
    }
    if (tokensMax === 'level') return character().level;
    if (tokensMax === 'proficiency') return character().proficiency;
    if (tokensMax === 'tier') return character().tier;
    if (['str', 'agi', 'fin', 'ins', 'pre', 'know'].includes(tokensMax)) return character().modified_traits[tokensMax];

    return parseInt(tokensMax);
  }

  const spendToken = (feature) => {
    refreshFeatures(feature.id, { tokens: feature.tokens - 1 });
  }

  const restoreToken = (feature) => {
    refreshFeatures(feature.id, { tokens: feature.tokens + 1 });
  }

  const renderTokens = (feature) => {
    const current = feature.tokens;
    const max = findTokensMax(feature.tokens_max)

    return (
      <div class="flex items-center gap-4">
        <p>{localize(TRANSLATION, locale()).tokens}</p>
        <Button default size="small" disabled={current === 0} onClick={() => current > 0 ? spendToken(feature) : null}><Minus /></Button>
        <Show when={max !== 1000} fallback={current}><p>{current} / {max}</p></Show>
        <Button default size="small" disabled={current === max} onClick={() => current < max ? restoreToken(feature) : null}><PlusSmall /></Button>
      </div>
    )
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Feats' }}>
      <GuideWrapper character={character()}>
        <Show
          when={filtering() === undefined || filtering().includes('groupFeatures')}
          fallback={
            <div id="character-navigation">
              <p class="active">{localize(TRANSLATION, locale()).allFeatures}</p>
              <Button default classList='rounded min-w-6 min-h-6 opacity-50 m-0!' onClick={() => setShowFilters(!showFilters())}>
                <Edit />
              </Button>
            </div>
          }
        >
          <Show when={activeFilter()}>
            <CharacterNavigation
              directTranslation={props.directTranslation}
              tabsList={filters().map((item) => item.title).filter((item) => item !== 'personal' || filtering() === undefined || filtering().includes('showPersonal'))}
              filters={filters()}
              activeTab={activeFilter()}
              setActiveTab={setActiveFilter}
            >
              <Button default classList='rounded min-w-6 min-h-6 opacity-50 m-0!' onClick={() => setShowFilters(!showFilters())}>
                <Edit />
              </Button>
            </CharacterNavigation>
          </Show>
        </Show>
        <div class="mt-2">
          <Show when={filtering() !== undefined && activeFilterOptions()}>
            <Show when={showFilters()}>
              <Select
                multi
                containerClassList="w-full md:w-1/2 mb-2"
                labelText={localize(TRANSLATION, locale())['settings']}
                items={{
                  'showPersonal': localize(TRANSLATION, locale()).showPersonal,
                  'groupFeatures': localize(TRANSLATION, locale()).groupFeatures,
                  'showPassive': localize(TRANSLATION, locale()).showPassive,
                  'expandAll': localize(TRANSLATION, locale()).expandAll
                }}
                selectedValues={filtering() || []}
                onSelect={(value) => updateFiltering(value)}
              />
            </Show>
            <Show when={activeFilter() === 'personal'}>
              <p class="dark:text-snow mb-2 text-sm">{localize(TRANSLATION, locale()).personalFeats} <a href={host()} class='underline' target='_blank' rel='noopener noreferrer'>{localize(TRANSLATION, locale()).here}</a></p>
            </Show>
            <Key
              each={filteredFeatures()}
              by={item => item.id}
            >
              {(feature) =>
                <Toggle
                  containerClassList={feature().kind === 'update_result' ? 'opacity-50' : ''}
                  isOpen={filtering().includes('expandAll')}
                  title={<FeatureTitle feature={feature()} character={character()} onSpendEnergy={spendEnergy} onRestoreEnergy={restoreEnergy} onReplaceCharacter={props.onReplaceCharacter} />}
                >
                  <div class="flex flex-col gap-2">
                    <Show when={feature().tokens !== undefined}>{renderTokens(feature())}</Show>
                    <div
                      class="feat-markdown"
                      innerHTML={feature().description} // eslint-disable-line solid/no-innerhtml
                    />
                    <Show when={character().provider === 'dc20'}>
                      <Show when={feature().info.range}>
                        <p class="text-sm">{localize(TRANSLATION, locale()).dc20Range}: {localize(feature().info.range, locale())}</p>
                      </Show>
                    </Show>
                    <Switch fallback={<></>}>
                      <Match when={feature().kind === 'text'}>
                        <TextArea
                          rows="5"
                          value={featValues()[feature().slug] || ''}
                          onChange={(value) => setFeatValues({ ...featValues(), [feature().slug]: value })}
                        />
                        <div class="flex justify-end">
                          <Button
                            default
                            textable
                            size="small"
                            onClick={() => updateFeatureValue(feature(), featValues()[feature().slug])}
                          >
                            {t('save')}
                          </Button>
                        </div>
                      </Match>
                      <Match when={(feature().kind === 'static_list' || feature().kind === 'one_from_list') && feature().options}>
                        <Select
                          withNull
                          containerClassList="w-full"
                          items={Object.entries(feature().options).reduce((acc, [key, value]) => { acc[key] = localize(value, locale()); return acc; }, {})}
                          selectedValue={featValues()[feature().slug]}
                          onSelect={(option) => updateFeatureValue(feature(), option)}
                        />
                      </Match>
                      <Match when={feature().kind === 'many_from_list' && feature().options}>
                        <Select
                          multi
                          containerClassList="w-full"
                          items={Object.entries(feature().options).reduce((acc, [key, value]) => { acc[key] = localize(value, locale()); return acc; }, {})}
                          selectedValues={featValues()[feature().slug] || []}
                          onSelect={(option) => updateMultiFeatureValue(feature(), option)}
                        />
                      </Match>
                      <Match when={(feature().kind === 'one_from_list' || feature().kind === 'many_from_list') && !feature().options && feature().info.options_list}>
                        <Show
                          when={feature().kind === 'many_from_list'}
                          fallback={
                            <Select
                              containerClassList="w-full"
                              items={renderFeatureOptions(feature())}
                              selectedValue={featValues()[feature().slug] || []}
                              onSelect={(option) => updateFeatureValue(feature(), option)}
                            />
                          }
                        >
                          <Select
                            multi
                            containerClassList="w-full"
                            items={renderFeatureOptions(feature())}
                            selectedValues={featValues()[feature().slug] || []}
                            onSelect={(option) => updateMultiFeatureValue(feature(), option)}
                          />
                        </Show>
                      </Match>
                      <Match when={feature().continious}>
                        <div class="flex justify-end">
                          <Checkbox
                            filled
                            labelText={localize(TRANSLATION, locale())['activeFeat']}
                            labelPosition="right"
                            labelClassList="ml-2"
                            checked={feature().active}
                            onToggle={() => refreshFeatures(feature().id, { active: !feature().active }, false)}
                          />
                        </div>
                      </Match>
                    </Switch>
                    <Show when={feature().info.enhancements && feature().info.enhancements.length > 0}>
                      <div class="flex flex-col gap-1">
                        <For each={feature().info.enhancements}>
                          {(enhancement) =>
                            <p class="feat-markdown text-sm">
                              <span class="font-medium!">{localize(enhancement.name, locale())} </span>
                              <Show when={enhancement.price}><span>: ({renderFeatPrice(enhancement)}) </span></Show>
                              <span
                                class="feat-markdown"
                                innerHTML={localize(enhancement.description, locale())} // eslint-disable-line solid/no-innerhtml
                              />
                            </p>
                          }
                        </For>
                      </div>
                    </Show>
                  </div>
                </Toggle>
              }
            </Key>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
