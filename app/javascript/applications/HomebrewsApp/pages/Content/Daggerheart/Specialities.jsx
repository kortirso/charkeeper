import { For } from 'solid-js';

import { useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
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

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
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
      onShowRequest={fetchSpecialityRequest}
      onRemoveRequest={removeSpecialityRequest}
      onCopyRequest={copySpecialityRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
