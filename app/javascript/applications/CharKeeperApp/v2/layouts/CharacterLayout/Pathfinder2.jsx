import { createMemo } from 'solid-js';

import { Character, Pathfinder2General, Pathfinder2Combat } from '../../layouts';
import { useAppLocale } from '../../context';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    general: 'General',
    equipment: 'Equipment',
    combat: 'Combat',
    feats: 'Feats',
    spells: 'Spells',
    notes: 'Notes'
  },
  ru: {
    general: 'Основное',
    equipment: 'Экипировка',
    combat: 'Сражение',
    feats: 'Черты',
    spells: 'Заклинания',
    notes: 'Заметки'
  },
  es: {
    general: 'General',
    equipment: 'Equipo',
    combat: 'Combate',
    feats: 'Habilidades',
    spells: 'Hechizos',
    notes: 'Notas'
  }
}

export const Pathfinder2 = (props) => {
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const tabs = createMemo(() => [
    { id: 'general', label: i18n().general, component: Pathfinder2General },
    { id: 'combat', label: i18n().combat, component: Pathfinder2Combat },
    { id: 'feats', label: i18n().feats },
    { id: 'spells', label: i18n().spells },
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
