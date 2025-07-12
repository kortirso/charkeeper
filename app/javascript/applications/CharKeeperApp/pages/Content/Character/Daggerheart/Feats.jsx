import { createSignal, For, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Button, Select, ErrorWrapper, FeatureTitle, TextArea } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterFeatRequest } from '../../../../requests/updateCharacterFeatRequest';

export const DaggerheartFeats = (props) => {
  const character = () => props.character;

  const [featValues, setFeatValues] = createSignal(
    character().features.reduce((acc, item) => { acc[item.slug] = item.value; return acc; }, {})
  );

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const spendEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: feature.used_count + 1 });
  }

  const restoreEnergy = (event, feature) => {
    event.stopPropagation();
    refreshFeatures(feature.id, { used_count: feature.used_count - 1 });
  }

  const updateFeatureValue = (feature, value) => {
    setFeatValues({ ...featValues(), [feature.slug]: value })
    refreshFeatures(feature.id, { value: value }, false);
  }

  const refreshFeatures = async (featureId, payload, refresh = true) => {
    const result = await updateCharacterFeatRequest(
      appState.accessToken,
      character().provider,
      character().id,
      featureId,
      { character_feat: payload, only_head: true }
    );

    const newFeatures = character().features.slice().map((element) => {
      if (element.id !== featureId) return element;
      return { ...element, ...payload }
    });

    if (result.errors === undefined) {
      if (refresh) props.onReplaceCharacter({ features: newFeatures });
    } else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartFeats' }}>
      <For each={character().features}>
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
              <Match when={feature.kind === 'static_list'}>
                <Select
                  containerClassList="w-full mt-2"
                  items={Object.entries(feature.options).reduce((acc, [key, value]) => { acc[key] = value[locale()]; return acc; }, {})}
                  selectedValue={featValues()[feature.slug]}
                  onSelect={(option) => updateFeatureValue(feature, option)}
                />
              </Match>
            </Switch>
          </Toggle>
        }
      </For>
    </ErrorWrapper>
  );
}
