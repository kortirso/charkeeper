import { For, Show } from 'solid-js';

import { SharedWeapon } from './SharedWeapon';
import { FeatureModifiers } from './FeatureModifiers';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchDomainRequest, removeDomainRequest, copyDomainRequest } from '../../../requests_v2/daggerheart/domains';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    level: 'Level',
    spell: 'Spell',
    ability: 'Ability',
    grimoire: 'Grimoire',
    recall: 'Recall cost'
  },
  ru: {
    level: 'Уровень',
    spell: 'Заклинание',
    ability: 'Способность',
    grimoire: 'Гримуар',
    recall: 'Цена призыва'
  },
  es: {
    level: 'Level',
    spell: 'Hechizo',
    ability: 'Habilidad',
    grimoire: 'Grimorio',
    recall: 'Recall cost'
  }
}

export const DaggerheartDomainsV2 = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Daggerheart::Homebrews::Domain');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Daggerheart::Homebrews::Domain', id);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Daggerheart::Homebrews::Domain', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <For each={props.info.features}>
        {(feature) =>
          <div class="flex flex-col gap-1">
            <p class="font-medium!">{feature.title} ({localize(TRANSLATION, locale()).level} {feature.conditions.level})</p>
            <p
              class="feat-markdown"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
            <p class="flex gap-4 text-sm">
              <Show when={feature.info.type}>
                <span>{localize(TRANSLATION, locale())[feature.info.type]}</span>
              </Show>
              <Show when={feature.info.recall}>
                <span>{localize(TRANSLATION, locale()).recall} - {feature.info.recall}</span>
              </Show>
            </p>
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
      publicationType="domain"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchDomainRequest}
      onRemoveRequest={removeDomainRequest}
      onCopyRequest={copyDomainRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
