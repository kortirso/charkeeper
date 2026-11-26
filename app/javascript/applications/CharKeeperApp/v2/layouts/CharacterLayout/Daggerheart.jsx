import { createMemo } from 'solid-js';

import { Character, DaggerheartGeneral, DaggerheartCombat } from '../../layouts';
import { useAppLocale } from '../../context';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    general: 'General',
    equipment: 'Equipment',
    combat: 'Combat',
    traits: 'Traits',
    domains: 'Domains',
    notes: 'Notes'
  },
  ru: {
    general: 'Основное',
    equipment: 'Экипировка',
    combat: 'Сражение',
    traits: 'Черты',
    domains: 'Домены',
    notes: 'Заметки'
  },
  es: {
    general: 'General',
    equipment: 'Equipo',
    combat: 'Combate',
    traits: 'Rasgos',
    domains: 'Dominios',
    notes: 'Notas'
  }
}

export const Daggerheart = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const tabs = createMemo(() => [
    { id: 'general', label: i18n().general, component: DaggerheartGeneral },
    { id: 'combat', label: i18n().combat, component: DaggerheartCombat },
    { id: 'traits', label: i18n().traits },
    { id: 'domains', label: i18n().domains },
    { id: 'equipment', label: i18n().equipment },
    { id: 'notes', label: i18n().notes }
  ]);

  return (
    <Character
      character={props.character}
      tabs={tabs()}
    />
  );
}
