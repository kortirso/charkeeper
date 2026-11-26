import { createMemo, For } from 'solid-js';

import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    health: 'Health',
    stress: 'Stress',
    hope: 'Hope',
    evasion: 'Evasion',
    armor: 'Armor'
  },
  ru: {
    health: 'Здоровье',
    stress: 'Стресс',
    hope: 'Надежда',
    evasion: 'Уклонение',
    armor: 'Броня'
  },
  es: {
    health: 'Salud',
    stress: 'Estrés',
    hope: 'Esperanza',
    evasion: 'Evasión',
    armor: 'Armadura'
  }
}

export const DaggerheartCombat = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const tracks = () => [
    [i18n().health, props.character.health_max, props.character.health_marked],
    [i18n().stress, props.character.stress_max, props.character.stress_marked],
    [i18n().hope, props.character.hope_max, props.character.hope_marked]
  ];

  return (
    <section class="character-general">
      <div class="character-track-grid">
        <For each={tracks()}>{([label, maximum, marked]) => <div class="character-vital-card"><span>{label}</span><strong>{marked ?? '—'} / {maximum ?? '—'}</strong></div>}</For>
        <div class="character-vital-card"><span>{i18n().evasion}</span><strong>{props.character.evasion ?? '—'}</strong></div>
        <div class="character-vital-card"><span>{i18n().armor}</span><strong>{props.character.armor_score ?? '—'}</strong></div>
      </div>
    </section>
  );
}
