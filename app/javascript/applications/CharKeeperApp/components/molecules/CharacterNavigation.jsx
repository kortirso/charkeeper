import { For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { useAppLocale } from '../../context';

export const CharacterNavigation = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <div id="character-navigation">
      <For each={props.tabsList}>
        {(tab) =>
          <p
            classList={{
              'active': props.activeTab === tab,
              'opacity-25': props.currentGuideStep && tab !== props.markedTabs[props.currentGuideStep.toString()],
              'text-black! dark:text-snow!': props.currentGuideStep && tab === props.markedTabs[props.currentGuideStep.toString()]
            }}
            onClick={() => props.setActiveTab(tab)}
          >
            {t(`pages.characterNavigation.${tab}`)}
          </p>
        }
      </For>
      <Show when={props.children}>{props.children}</Show>
    </div>
  );
}
