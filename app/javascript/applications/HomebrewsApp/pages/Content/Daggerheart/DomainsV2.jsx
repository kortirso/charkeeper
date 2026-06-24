import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest } from '../../../requests_v2/list';
import { fetchDomainRequest, removeDomainRequest, copyDomainRequest } from '../../../requests_v2/daggerheart/domains';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    level: 'Level'
  },
  ru: {
    level: 'Уровень'
  },
  es: {
    level: 'Level'
  }
}

export const DaggerheartDomainsV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Domain');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <For each={props.info.features}>
        {(feature) =>
          <div>
            <p class="font-medium!">{feature.title} ({localize(TRANSLATION, locale()).level} {feature.conditions.level})</p>
            <p
              class="feat-markdown mt-1"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <Show when={feature?.items}>
              <div class="pl-4 mt-2">
                <For each={feature?.items}>
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
      parentType="Daggerheart::Homebrews::Domain"
      publicationType="domain"
      onFetchRequest={fetchList}
      onShowRequest={fetchDomainRequest}
      onRemoveRequest={removeDomainRequest}
      onCopyRequest={copyDomainRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
