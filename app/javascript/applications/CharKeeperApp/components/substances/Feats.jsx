import { createSignal, createEffect, createMemo, Switch, Match, batch, Show, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { Key } from '@solid-primitives/keyed';
import { createStore } from 'solid-js/store';

import {
  Toggle, Button, Select, ErrorWrapper, FeatureTitle, TextArea, CharacterNavigation, Checkbox, GuideWrapper, Dice, Input
} from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { Edit, PlusSmall, Minus, Close } from '../../assets';
import { updateCharacterFeatRequest } from '../../requests/updateCharacterFeatRequest';
import { createCharacterBotRequest } from '../../requests/createCharacterBotRequest';
import { createFeatRequest } from '../../requests/createFeatRequest';
import { removeFeatRequest } from '../../requests/removeFeatRequest';
import { changeFeatRequest } from '../../requests/changeFeatRequest';
import { readFromCache, writeToCache, localize, translate, performResponse } from '../../helpers';

const FEATURES_FILTER_NAME = 'FeaturesFiltersStatus';
const TRANSLATION = {
  en: {
    activeFeat: 'Active',
    allFeatures: 'All features',
    personalFeats: 'Add personal/custom feat',
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
    tokens: 'Tokens',
    reserve: 'Reserve',
    textHelp: 'You can use Markdown for editing description',
    newFeatTitle: 'Title',
    newFeatValue: 'Feat text'
  },
  ru: {
    activeFeat: 'Активен',
    allFeatures: 'Все способности',
    personalFeats: 'Добавить способность',
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
    tokens: 'Жетоны',
    reserve: 'Резерв',
    textHelp: 'Вы можете использовать Markdown для редактирования описания',
    newFeatTitle: 'Заголовок',
    newFeatValue: 'Описание способности'
  },
  es: {
    activeFeat: 'Activo',
    allFeatures: 'Todas las habilidades',
    personalFeats: 'Add personal/custom feat',
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
    tokens: 'Tokens',
    reserve: 'Reserve',
    textHelp: 'You can use Markdown for editing description',
    newFeatTitle: 'Title',
    newFeatValue: 'Feat text'
  }
}

export const Feats = (props) => {
  const character = () => props.character;
  const filters = () => props.filters;

  const [showFilters, setShowFilters] = createSignal(false);
  const [filtering, setFiltering] = createSignal(undefined);
  const [activeFilter, setActiveFilter] = createSignal(filters()[0]?.title);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [featValues, setFeatValues] = createSignal(
    character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {})
  );
  const [activeNewFeat, setActiveNewFeat] = createSignal(false);
  const [featForm, setFeatForm] = createStore({ title: '', description: '' });
  const [refreshKey, setRefreshKey] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const readFeaturesToggle = async () => {
    const cacheValue = await readFromCache(FEATURES_FILTER_NAME);
    setFiltering(cacheValue === null || cacheValue === undefined ? ['groupFeatures'] : cacheValue.split(','));
  }

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setFeatValues(character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {}));
      setLastActiveCharacterId(character().id);
      setActiveFilter(filters()[0]?.title);
    });

    readFeaturesToggle();
  });

  const i18nMem = createMemo(() => localize(TRANSLATION, locale()));

  const activeFilterOptions = createMemo(() => filters().find((item) => item.title === activeFilter()));

  const filteredFeatures = createMemo(() => {
    if (filtering() === undefined) return character().features;
    refreshKey(); // tracks the trigger

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

  const refreshFeatures = async (featureId, payload, reload = true) => {
    const result = await updateCharacterFeatRequest(
      appState.accessToken, character().provider, character().id, featureId, { character_feat: payload }
    );

    if (result.errors_list === undefined) {
      if (reload) props.onReloadCharacter();
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
      if (price === null) return `X ${i18nMem().prices[slug]}`;

      return `${price} ${i18nMem().prices[slug]}`;
    });

    if (enhancement.repeatable) result.push(i18nMem().repeatable);

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
        <p>{i18nMem().tokens}</p>
        <Button default size="small" disabled={current === 0} onClick={() => current > 0 ? spendToken(feature) : null}><Minus /></Button>
        <Show when={max !== 1000} fallback={current}><p>{current} / {max}</p></Show>
        <Button default size="small" disabled={current === max} onClick={() => current < max ? restoreToken(feature) : null}><PlusSmall /></Button>
      </div>
    )
  }

  const roll = async (feature) => {
    const result = await createCharacterBotRequest(appState.accessToken, character().id, { values: [`/roll d${feature.dice_settings.value}`] });

    if (result.errors_list === undefined) {
      const dices = feature.dices;
      dices.push(result.result[0].result.total);

      refreshFeatures(feature.id, { dices: dices }, false);
      const payload = character().features.map((item) => {
        if (item.id !== feature.id) return item;

        return { ...item, dices: dices };
      });
      props.onReplaceCharacter({ features: payload });
    } else renderAlerts(result.errors_list);
  }

  const removeRoll = (feature, index) => {
    feature.dices.splice(index, 1);
    refreshFeatures(feature.id, { dices: feature.dices }, false);
    const payload = character().features.map((item) => {
      if (item.id !== feature.id) return item;

      return { ...item, dices: feature.dices };
    });
    props.onReplaceCharacter({ features: payload });
  }

  const reroll = async (feature, index) => {
    const result = await createCharacterBotRequest(appState.accessToken, character().id, { values: [`/roll d${feature.dice_settings.value}`] });

    if (result.errors_list === undefined) {
      const dices = feature.dices;
      const newRollResults = [...dices.slice(0, index), result.result[0].result.total, ...dices.slice(index + 1)];

      refreshFeatures(feature.id, { dices: newRollResults });
    } else renderAlerts(result.errors_list);
  }

  const addFeat = () => {
    batch(() => {
      setFeatForm({ title: '', description: '' });
      setActiveNewFeat(true);
    });
  }

  const changeFeature = (e, feature) => {
    e.stopPropagation();

    batch(() => {
      setFeatForm({ id: feature.id, title: feature.title, description: feature.raw });
      setActiveNewFeat(true);
    });
  }

  const cancelFeat = () => {
    batch(() => {
      setFeatForm({ title: '', description: '' });
      setActiveNewFeat(false);
    });
  }

  const createFeat = async () => {
    const result = await createFeatRequest(appState.accessToken, character().provider, character().id, { feat: featForm });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        cancelFeat();
        props.onReplaceCharacter({ features: [...character().features, result.feat] });
        setRefreshKey(refreshKey() + 1)
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const removeFeature = async (e, feature) => {
    e.stopPropagation();

    const result = await removeFeatRequest(appState.accessToken, character().provider, character().id, feature.id, feature.id);
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter({ features: character().features.filter((item) => item.id !== feature.id) });
        setRefreshKey(refreshKey() + 1)
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  const updateFeat = async () => {
    const result = await changeFeatRequest(appState.accessToken, character().provider, character().id, featForm.id, { feat: featForm });
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        const features = character().features.slice().map((item) => {
          if (item.id !== featForm.id) return item;

          return result.feat;
        });
        props.onReplaceCharacter({ features: features });
        setRefreshKey(refreshKey() + 1)
        cancelFeat();
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Feats' }}>
      <GuideWrapper character={character()}>
        <Show
          when={filtering() === undefined || filtering().includes('groupFeatures')}
          fallback={
            <div id="character-navigation">
              <p class="active">{i18nMem().allFeatures}</p>
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
                labelText={i18nMem()['settings']}
                items={{
                  'showPersonal': i18nMem().showPersonal,
                  'groupFeatures': i18nMem().groupFeatures,
                  'showPassive': i18nMem().showPassive,
                  'expandAll': i18nMem().expandAll
                }}
                selectedValues={filtering() || []}
                onSelect={(value) => updateFiltering(value)}
              />
            </Show>
            <Show when={activeFilter() === 'personal'}>
              <Show
                when={!activeNewFeat()}
                fallback={
                  <div class="p-4 flex-1 flex flex-col blockable mb-2">
                    <div class="flex-1">
                      <Input
                        containerClassList="mb-2"
                        labelText={i18nMem().newFeatTitle}
                        value={featForm.title}
                        onInput={(value) => setFeatForm({ ...featForm, title: value })}
                      />
                      <TextArea
                        rows="5"
                        labelText={i18nMem().newFeatValue}
                        value={featForm.description}
                        onChange={(value) => setFeatForm({ ...featForm, description: value })}
                      />
                      <p class="text-sm mt-1">{i18nMem().textHelp}</p>
                    </div>
                    <div class="flex justify-end mt-4">
                      <Button outlined textable size="small" classList="mr-4" onClick={cancelFeat}><span>{t('cancel')}</span></Button>
                      <Button default textable size="small" onClick={() => featForm.id === undefined ? createFeat() : updateFeat()}>
                        <span>{t('save')}</span>
                      </Button>
                    </div>
                  </div>
                }
              >
                <div class="flex items-center mb-2">
                  <Button default size="small" onClick={addFeat}><PlusSmall /></Button>
                  <span class="dark:text-snow ml-2 text-sm">{i18nMem().personalFeats}</span>
                </div>
              </Show>
            </Show>
            <Key each={filteredFeatures()} by={item => item.id}>
              {(feature) =>
                <Toggle
                  containerClassList={feature().kind === 'update_result' ? 'opacity-50' : ''}
                  isOpen={filtering().includes('expandAll')}
                  title={
                    <FeatureTitle
                      feature={feature()}
                      character={character()}
                      onSpendEnergy={spendEnergy}
                      onRestoreEnergy={restoreEnergy}
                      onReplaceCharacter={props.onReplaceCharacter}
                      removeFeature={removeFeature}
                      changeFeature={changeFeature}
                    />
                  }
                >
                  <div class="flex flex-col gap-2">
                    <Show when={feature().tokens !== undefined}>{renderTokens(feature())}</Show>
                    <div
                      class="feat-markdown"
                      innerHTML={feature().description} // eslint-disable-line solid/no-innerhtml
                    />
                    <Show when={character().provider === 'dc20'}>
                      <Show when={feature().info.range}>
                        <p class="text-sm">{i18nMem().dc20Range}: {localize(feature().info.range, locale())}</p>
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
                    </Switch>
                    <Show when={feature().dice_settings}>
                      <div class="flex items-center gap-4">
                        <For each={[...Array(feature().dice_settings.limit + 1)]}>
                          {(value, index) =>
                            <Show when={index() !== feature().dice_settings.limit || feature().dices.length >= feature().dice_settings.limit}>
                              <div class="relative">
                                <Dice
                                  hidden={feature().dices[index()] === undefined}
                                  width={index() !== feature().dice_settings.limit ? '50' : '40'}
                                  height={index() !== feature().dice_settings.limit ? '50' : '40'}
                                  type={`D${feature().dice_settings.value}`}
                                  text={feature().dices[index()] || `D${feature().dice_settings.value}`}
                                  textClassList="text-xl"
                                  onClick={() => feature().dices[index()] ? reroll(feature(), index()) : roll(feature())}
                                />
                                <Show when={index() === feature().dice_settings.limit}>
                                  <p class="text-xs">{i18nMem().reserve}</p>
                                </Show>
                                <Show when={feature().dices[index()]}>
                                  <Button default classList="absolute top-0 right-0 w-4! h-4! min-h-4! min-w-4!" onClick={() => removeRoll(feature(), index())}>
                                    <Close width="16" height="16" />
                                  </Button>
                                </Show>
                              </div>
                            </Show>
                          }
                        </For>
                      </div>
                    </Show>
                    <Show when={feature().continious}>
                      <div class="flex justify-end">
                        <Checkbox
                          filled
                          labelText={i18nMem()['activeFeat']}
                          labelPosition="right"
                          labelClassList="ml-2"
                          checked={feature().active}
                          onToggle={() => refreshFeatures(feature().id, { active: !feature().active }, false)}
                        />
                      </div>
                    </Show>
                    <Show when={feature().info?.enhancements && feature().info.enhancements.length > 0}>
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
