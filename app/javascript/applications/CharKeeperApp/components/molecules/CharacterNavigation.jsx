import { For } from 'solid-js';
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
            classList={{ 'active': props.activeTab === tab }}
            onClick={() => props.setActiveTab(tab)}
          >
            {t(`pages.characterNavigation.${tab}`)}
          </p>
        }
      </For>
      <For each={props.disableTabsList}>
        {(tab) =>
          <p class="disabled">
            {t(`pages.characterNavigation.${tab}`)}
          </p>
        }
      </For>
    </div>
  );
}
