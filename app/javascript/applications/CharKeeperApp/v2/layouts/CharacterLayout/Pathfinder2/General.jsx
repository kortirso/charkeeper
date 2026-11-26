import { createMemo, For, Show } from 'solid-js';

import { CharacterAvatar } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';
import { Star } from '../../../assets';
import config from '../../../data/pathfinder2.json';

const TRANSLATION = {
  en: {
    health: 'Health',
    armorClass: 'AC',
    abilities: 'Abilities',
    savingThrows: 'Saving throws',
    level: 'Level'
  },
  ru: {
    health: 'Здоровье',
    armorClass: 'КБ',
    abilities: 'Характеристики',
    savingThrows: 'Спасброски',
    level: 'Уровень'
  },
  es: {
    health: 'Salud',
    armorClass: 'CA',
    abilities: 'Características',
    savingThrows: 'Tiradas de salvación',
    level: 'Nivel'
  }
}

const signed = (value) => value > 0 ? `+${value}` : value ?? '—';

export const Pathfinder2General = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const abilities = () => props.character.modified_abilities || {};
  const saves = () => props.character.saving_throws_value || {};
  const subtitle = () => [props.character.names?.race_name, props.character.names?.class_name, props.character.level && `${i18n().level} ${props.character.level}`].filter(Boolean).join(' · ');

  return (
    <section class="character-general">
      <header class="character-identity">
        <CharacterAvatar avatar={props.avatar} />
        <div><h1>{props.character.name}</h1><p>{subtitle()}</p></div>
      </header>
      <div class="character-stat-section">
        <h2>{i18n().abilities}</h2>
        <div class="character-stat-grid character-stat-grid-six">
          <For each={Object.entries(config.abilities).map(([key, values]) => [key, localize(values.shortName, locale())])}>
            {([slug, name]) =>
              <div class="character-stat">
                <div class="character-stat-title">
                  <Show when={props.character.main_ability === slug}>
                    <Star width="16" height="16" />
                  </Show>
                  <p>{name}</p>
                </div>
                <strong>{signed(abilities()[slug])}</strong>
              </div>
            }
          </For>
        </div>
      </div>
      <div class="character-stat-section">
        <h2>{i18n().savingThrows}</h2>
        <div class="character-stat-grid character-stat-grid-three">
          <For each={Object.entries(config.savingThrows).map(([key, values]) => [key, localize(values.name, locale())])}>
            {([slug, name]) =>
              <div class="character-stat">
                <div class="character-stat-title"><span>{name}</span></div>
                <strong>{signed(saves()[slug])}</strong>
              </div>
            }
          </For>
        </div>
      </div>
    </section>
  );
}
