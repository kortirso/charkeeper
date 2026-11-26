import { createMemo } from 'solid-js';

import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    health: 'Health',
    armorClass: 'AC'
  },
  ru: {
    health: 'Здоровье',
    armorClass: 'КБ'
  },
  es: {
    health: 'Salud',
    armorClass: 'CA'
  }
}

export const Pathfinder2Combat = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const health = () => props.character.health || {};
  const healthPercent = () => health().max ? Math.min(100, Math.max(0, (health().current / health().max) * 100)) : 0;

  return (
    <section class="character-general">
      <div class="character-vitals">
        <div class="character-health">
          <div><span>{i18n().health}</span><strong>{health().current ?? '—'} / {health().max ?? '—'}</strong></div>
          <div class="character-health-track"><span style={{ width: `${healthPercent()}%` }} /></div>
        </div>
        <div class="character-vital-card"><span>{i18n().armorClass}</span><strong>{props.character.armor_class ?? '—'}</strong></div>
      </div>
    </section>
  );
}
