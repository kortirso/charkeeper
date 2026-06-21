import { For, Show } from 'solid-js';

import config from '../../../../CharKeeperApp/data/daggerheart.json';

import { useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchSubclassRequest, removeSubclassRequest, copySubclassRequest } from '../../../requests_v2/daggerheart/subclasses';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    className: 'Class name',
    spellcast: 'Spellcast trait',
    mechanics: 'Available mechanics',
    none: 'None'
  },
  ru: {
    className: 'Базовый класс',
    spellcast: 'Заклинательная способность',
    mechanics: 'Доступные механики',
    none: 'Нет'
  },
  es: {
    className: 'Class name',
    spellcast: 'Spellcast trait',
    mechanics: 'Available mechanics',
    none: 'None'
  }
}

export const DaggerheartSubclasses = () => {
  const [locale] = useAppLocale();

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-4">
      <p>{localize(TRANSLATION, locale()).className} - {props.info.class_name}</p>
      <p>{localize(TRANSLATION, locale()).spellcast} - <Show when={props.info.info.spellcast} fallback={localize(TRANSLATION, locale()).none}>{localize(config.traits[props.info.info.spellcast].name, locale())}</Show></p>
      <p>{localize(TRANSLATION, locale()).mechanics} - <Show when={props.info.info.mechanics.length > 0} fallback={localize(TRANSLATION, locale()).none}>{props.info.info.mechanics.map((item) => localize(config.mechanics[item].name, locale())).join(', ')}</Show>
      </p>
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
      parentType="Daggerheart::Homebrews::Subclass"
      publicationType="subclass"
      onShowRequest={fetchSubclassRequest}
      onRemoveRequest={removeSubclassRequest}
      onCopyRequest={copySubclassRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
