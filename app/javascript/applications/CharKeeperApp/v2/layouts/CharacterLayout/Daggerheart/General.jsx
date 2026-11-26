import { createMemo, For, Show } from 'solid-js';

import { CharacterAvatar } from '../../../components';
import { useAppLocale, useAppState } from '../../../context';
import { localize } from '../../../helpers';
import { Star } from '../../../assets';
import config from '../../../data/daggerheart.json';

const TRANSLATION = {
  en: {
    level: 'Level',
    characteristics: 'Traits'
  },
  ru: {
    level: 'Уровень',
    characteristics: 'Характеристики'
  },
  es: {
    level: 'Nivel',
    characteristics: 'Rasgos'
  }
}

const signed = (value) => value > 0 ? `+${value}` : value ?? '—';

export const DaggerheartGeneral = (props) => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const currentLocale = createMemo(() => {
    const providerLocale = appState.providerLocales['daggerheart'];
    if (providerLocale && providerLocale.includes(`${locale()}-`)) return providerLocale;
    return locale();
  });

  const traits = () => props.character.modified_traits || {};
  const subtitle = () => [props.character.names?.ancestry_name, props.character.names?.community_name, props.character.level && `${i18n().level} ${props.character.level}`].filter(Boolean).join(' · ');

  return (
    <section class="character-general">
      <header class="character-identity">
        <CharacterAvatar avatar={props.avatar} />
        <div><h1>{props.character.name}</h1><p>{subtitle()}</p></div>
      </header>
      <div class="character-stat-section">
        <h2>{i18n().characteristics}</h2>
        <div class="character-stat-grid character-stat-grid-six">
          <For each={Object.entries(config.traits).map(([key, values]) => [key, localize(values.shortName, currentLocale())])}>
            {([slug, name]) =>
              <div class="character-stat">
                <div class="character-stat-title">
                  <Show when={props.character.spellcast_traits[0] === slug}>
                    <Star width="16" height="16" />
                  </Show>
                  <p>{name}</p>
                </div>
                <strong>{signed(traits()[slug])}</strong>
              </div>
            }
          </For>
        </div>
      </div>
    </section>
  );
}
