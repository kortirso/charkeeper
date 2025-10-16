import { createSignal, createEffect, createMemo, For, Switch, Match, batch, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Button, Select, ErrorWrapper, FeatureTitle, TextArea, CharacterNavigation, Checkbox } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { updateCharacterFeatRequest } from '../../requests/updateCharacterFeatRequest';

const TRANSLATION = {
  en: {
    activeFeat: 'Active'
  },
  ru: {
    activeFeat: 'Активен'
  }
}

export const Feats = (props) => {
  const character = () => props.character;
  const filters = () => props.filters;

  const [activeFilter, setActiveFilter] = createSignal(filters()[0].title);
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [featValues, setFeatValues] = createSignal(
    character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {})
  );

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setFeatValues(character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {}));
      setLastActiveCharacterId(character().id);
      setActiveFilter(filters()[0].title);
    });
  });

  const activeFilterOptions = createMemo(() => filters().find((item) => item.title === activeFilter()));

  const spendEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: feature.used_count + 1 });
  }

  const restoreEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: feature.used_count - 1 });
  }

  const updateFeatureValue = (feature, value) => {
    setFeatValues({ ...featValues(), [feature.slug]: value });
    refreshFeatures(feature.id, { value: value }, false);
  }

  const updateMultiFeatureValue = (feature, value) => {
    const currentValues = featValues()[feature.slug];
    if (currentValues) {
      const newValue = currentValues.includes(value) ? currentValues.filter((item) => item !== value) : currentValues.concat([value]);
      setFeatValues({ ...featValues(), [feature.slug]: newValue });
    } else {
      setFeatValues({ ...featValues(), [feature.slug]: [value] });
    }
    refreshFeatures(feature.id, { value: featValues()[feature.slug] }, false);
  }

  const refreshFeatures = async (featureId, payload, refresh = true) => {
    const result = await updateCharacterFeatRequest(
      appState.accessToken,
      character().provider,
      character().id,
      featureId,
      { character_feat: payload, only_head: true }
    );

    if (result.errors_list === undefined) {
      if (refresh) {
        const newFeatures = character().features.slice().map((element) => {
          if (element.id !== featureId) return element;
          return { ...element, ...payload };
        });
        props.onReplaceCharacter({ features: newFeatures });
      } else {
        props.onReloadCharacter();
      }
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Feats' }}>
      <CharacterNavigation
        tabsList={filters().map((item) => item.title)}
        activeTab={activeFilter()}
        setActiveTab={setActiveFilter}
      />
      <div class="mt-2">
        <Show when={activeFilterOptions()}>
          <Show when={activeFilter() === 'personal'}>
            <p class="dark:text-snow mb-2 text-sm">{t('pages.homebrewPage.personalFeats')}</p>
          </Show>
          <For each={character().features.filter(activeFilterOptions().callback)}>
            {(feature) =>
              <Toggle title={<FeatureTitle feature={feature} onSpendEnergy={spendEnergy} onRestoreEnergy={restoreEnergy} />}>
                <p
                  class="text-sm"
                  innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
                />
                <Switch fallback={<></>}>
                  <Match when={feature.kind === 'text'}>
                    <TextArea
                      rows="5"
                      containerClassList="mt-2"
                      value={featValues()[feature.slug] || ''}
                      onChange={(value) => setFeatValues({ ...featValues(), [feature.slug]: value })}
                    />
                    <div class="flex justify-end mt-2">
                      <Button
                        default
                        textable
                        size="small"
                        onClick={() => updateFeatureValue(feature, featValues()[feature.slug])}
                      >
                        {t('save')}
                      </Button>
                    </div>
                  </Match>
                  <Match when={feature.kind === 'static_list' || feature.kind === 'one_from_list'}>
                    <Select
                      containerClassList="w-full mt-2"
                      items={Object.entries(feature.options).reduce((acc, [key, value]) => { acc[key] = value[locale()]; return acc; }, {})}
                      selectedValue={featValues()[feature.slug]}
                      onSelect={(option) => updateFeatureValue(feature, option)}
                    />
                  </Match>
                  <Match when={feature.kind === 'many_from_list'}>
                    <Select
                      multi
                      containerClassList="w-full mt-2"
                      items={Object.entries(feature.options).reduce((acc, [key, value]) => { acc[key] = value[locale()]; return acc; }, {})}
                      selectedValues={featValues()[feature.slug] || []}
                      onSelect={(option) => updateMultiFeatureValue(feature, option)}
                    />
                  </Match>
                  <Match when={feature.continious}>
                    <div class="mt-2 flex justify-end">
                      <Checkbox
                        filled
                        labelText={TRANSLATION[locale()]['activeFeat']}
                        labelPosition="right"
                        labelClassList="ml-2"
                        checked={feature.active}
                        onToggle={() => refreshFeatures(feature.id, { active: !feature.active }, false)}
                      />
                    </div>
                  </Match>
                </Switch>
              </Toggle>
            }
          </For>
        </Show>
      </div>
    </ErrorWrapper>
  );
}
