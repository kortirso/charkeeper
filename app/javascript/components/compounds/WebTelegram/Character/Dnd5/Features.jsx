import { createSignal, Switch, Match, For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Select, Checkbox, Toggle } from '../../../../atoms';

import { useAppLocale } from '../../../../../context';

export const Dnd5Features = (props) => {
  // changeable data
  const [featuresData, setFeaturesData] = createSignal(props.initialSelectedFeatures);

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const toggleFeatureOption = (feature, option) => {
    const selectedOptions = featuresData()[feature.slug];

    if (selectedOptions) {
      let newOptions;
      if (selectedOptions.includes(option)) {
        newOptions = selectedOptions.filter((item) => item !== option);
      } else {
        newOptions = selectedOptions.concat(option);
      }
      setFeaturesData({ ...featuresData(), [feature.slug]: newOptions });
    } else {
      setFeaturesData({ ...featuresData(), [feature.slug]: [option] });
    }
  }

  // submits
  const updateCharacterFeatures = async () => {
    await props.onReloadCharacter({ selected_features: featuresData() });
  }

  return (
    <>
      <div class="flex flex-col">
        <Show
          when={props.features !== undefined && props.features.length > 0}
          fallback={<p>{t('character.no_features')}</p>}
        >
          <For each={props.features}>
            {(feature) =>
              <Toggle title={feature.name[locale()]}>
                <p class="text-sm mb-2">{feature.description[locale()]}</p>
                <Switch>
                  <Match when={feature.options_type === 'static' && feature.limit === undefined}>
                    <For each={feature.options}>
                      {(option) =>
                        <div class="mb-2">
                          <Checkbox
                            labelText={t(`selectedFeatures.${feature.slug}.${option}`)}
                            labelPosition="right"
                            labelClassList="text-sm ml-4"
                            checked={featuresData()[feature.slug]?.includes(option)}
                            onToggle={() => toggleFeatureOption(feature, option)}
                          />
                        </div>
                      }
                    </For>
                  </Match>
                  <Match when={feature.options_type === 'static' && feature.limit === 1}>
                    <Select
                      classList="w-full mb-2"
                      items={feature.options.reduce((acc, option) => { acc[option] = t(`selectedFeatures.${feature.slug}.${option}`); return acc; }, {})}
                      selectedValue={featuresData()[feature.slug]}
                      onSelect={(option) => setFeaturesData({ ...featuresData(), [feature.slug]: [option] })}
                    />
                  </Match>
                  <Match when={feature.options_type === 'choose_from' && feature.options === 'selected_skills'}>
                    <For each={props.skills.filter((item) => item.selected).map((item) => item.name)}>
                      {(option) =>
                        <div class="mb-2">
                          <Checkbox
                            labelText={t(`skills.${option}`)}
                            labelPosition="right"
                            labelClassList="text-sm ml-4"
                            checked={featuresData()[feature.slug]?.includes(option)}
                            onToggle={() => toggleFeatureOption(feature, option)}
                          />
                        </div>
                      }
                    </For>
                  </Match>
                  <Match when={feature.options_type === 'text'}>
                    <textarea
                      rows="5"
                      class="w-full border border-gray-200 rounded p-1 text-sm"
                      onInput={(e) => setFeaturesData({ ...featuresData(), [feature.slug]: e.target.value })}
                      value={featuresData()[feature.slug] || ''}
                    />
                  </Match>
                </Switch>
              </Toggle>
            }
          </For>
          <button class="btn" onClick={updateCharacterFeatures}>{t('save')}</button>
        </Show>
      </div>
    </>
  );
}
