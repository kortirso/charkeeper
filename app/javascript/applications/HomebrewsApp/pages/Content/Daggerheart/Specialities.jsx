import { For } from 'solid-js';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest } from '../../../requests_v2/list';
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

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>ID - {props.info.id}</p>
      <p>{localize(TRANSLATION, locale()).evasion} - {props.info.info.evasion}</p>
      <p>{localize(TRANSLATION, locale()).healthMax} - {props.info.info.health_max}</p>
      <p>{localize(TRANSLATION, locale()).domains} - {props.info.domains.join(', ')}</p>
      <For each={props.info.features}>
        {(feature) =>
          <div>
            <p class="font-medium!">{feature.title}</p>
            <p
              class="feat-markdown mt-1"
              innerHTML={feature.description} // eslint-disable-line solid/no-innerhtml
            />
          </div>
        }
      </For>
    </div>
  );

  return (
    <SharedContent
      provider="daggerheart"
      parentType="Daggerheart::Homebrews::Speciality"
      publicationType="speciality"
      onFetchRequest={fetchList}
      onShowRequest={fetchSpecialityRequest}
      onRemoveRequest={removeSpecialityRequest}
      onCopyRequest={copySpecialityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
