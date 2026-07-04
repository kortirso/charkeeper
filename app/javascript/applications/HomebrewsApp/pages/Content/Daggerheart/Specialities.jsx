import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchSpecialityRequest, removeSpecialityRequest, copySpecialityRequest } from '../../../requests_v2/daggerheart/specialities';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    evasion: 'Evasion',
    healthMax: 'Starting health',
    domains: 'Domains'
  },
  ru: {
    evasion: 'Уклонение',
    healthMax: 'Здоровье',
    domains: 'Домены'
  },
  es: {
    evasion: 'Evasión',
    healthMax: 'Salud inicial',
    domains: 'Dominios'
  }
}

export const DaggerheartSpecialities = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Speciality');
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Speciality', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <p>{localize(TRANSLATION, locale()).evasion} - {props.info.info.evasion}</p>
      <p>{localize(TRANSLATION, locale()).healthMax} - {props.info.info.health_max}</p>
      <p>{localize(TRANSLATION, locale()).domains} - {props.info.domains.join(', ')}</p>
      <For each={props.info.features}>
        {(feature) =>
          <div class="flex flex-col gap-1">
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <Show when={Object.keys(feature.modifiers).length > 0}>
              <FeatureModifiers items={feature.modifiers} />
            </Show>
            <Show when={feature.items}>
              <div class="pl-4">
                <For each={feature.items}>
                  {(item) =>
                    <SharedWeapon info={item} />
                  }
                </For>
              </div>
            </Show>
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      publicationType="speciality"
      onFetchRequest={fetchList}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchSpecialityRequest}
      onRemoveRequest={removeSpecialityRequest}
      onCopyRequest={copySpecialityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
