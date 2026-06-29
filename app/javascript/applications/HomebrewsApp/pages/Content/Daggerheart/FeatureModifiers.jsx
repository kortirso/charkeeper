import { For } from 'solid-js';

import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    str: 'Strength',
    agi: 'Agility',
    fin: 'Finesse',
    ins: 'Instinct',
    pre: 'Presence',
    know: 'Knowledge',
    health: 'Health',
    stress: 'Stress',
    hope: 'Hope',
    evasion: 'Evasion',
    armor_score: 'Armor score',
    major: 'Major threshold',
    severe: 'Severe threshold',
    attack: 'Attacks',
    damage: 'Damage',
    spell_bonus: 'Spellcast roll'
  },
  ru: {
    str: 'Сила',
    agi: 'Проворность',
    fin: 'Искусность',
    ins: 'Инстинкт',
    pre: 'Влияние',
    know: 'Знание',
    health: 'Здоровье',
    stress: 'Стресс',
    hope: 'Надежда',
    evasion: 'Уклонение',
    armor_score: 'Слоты Доспеха',
    major: 'Ощутимый урон',
    severe: 'Тяжёлый урон',
    attack: 'Атаки',
    damage: 'Урон',
    spell_bonus: 'Бросок заклинаний'
  },
  es: {
    str: 'Fuerza',
    agi: 'Agilidad',
    fin: 'Fineza',
    ins: 'Instinto',
    pre: 'Presencia',
    know: 'Conocimiento',
    health: 'Salud',
    stress: 'Estrés',
    hope: 'Esperanza',
    evasion: 'Evasión',
    armor_score: 'Puntuación de armadura',
    major: 'Umbral mayor',
    severe: 'Umbral severo',
    attack: 'Ataques',
    damage: 'Damage',
    spell_bonus: 'Spellcast roll'
  }
}

export const FeatureModifiers = (props) => {
  const [locale] = useAppLocale();

  return (
    <div class="flex gap-1 text-sm">
      <For each={Object.entries(props.items)}>
        {([key, values]) =>
          <p class="bg-gray-200 p-1 rounded">
            {localize(TRANSLATION, locale())[key]} {values.value}
          </p>
        }
      </For>
    </div>
  );
}
