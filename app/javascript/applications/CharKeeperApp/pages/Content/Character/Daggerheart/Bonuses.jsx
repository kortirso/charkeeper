import { ErrorWrapper, GuideWrapper, SharedBonusesV2 } from '../../../../components';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    warning: "Formula can contain math expressions and some variables. For example, '2', '-1', '2 * level'. There are integrated functions: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c)."
  },
  ru: {
    warning: "Формула может содержать математические выражения и переменные. Например, '2', '-1', '2 * level'. Также есть встроенные функции: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c)."
  },
  es: {
    warning: "La fórmula puede contener expresiones matemáticas y variables. Por ejemplo, '2', '-1', '2 * level'. Hay funciones integradas: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c)."
  }
}

const MAPPING = {
  en: {
    'str': 'Strength',
    'agi': 'Agility',
    'fin': 'Finesse',
    'ins': 'Instinct',
    'pre': 'Presence',
    'know': 'Knowledge',
    'health_max': 'Health',
    'stress_max': 'Stress',
    'hope_max': 'Hope',
    'evasion': 'Evasion',
    'armor_score': 'Armor score',
    'damage_thresholds.major': 'Major threshold',
    'damage_thresholds.severe': 'Severe threshold',
    'attack': 'Attacks',
    'proficiency': 'Proficiency',
    'damage': 'Damage',
    'spell_bonus': 'Spellcast',
    'loadout': 'Loadout'
  },
  ru: {
    'str': 'Сила',
    'agi': 'Проворность',
    'fin': 'Искусность',
    'ins': 'Инстинкт',
    'pre': 'Влияние',
    'know': 'Знание',
    'health_max': 'Здоровье',
    'stress_max': 'Стресс',
    'hope_max': 'Надежда',
    'evasion': 'Уклонение',
    'armor_score': 'Ячейки брони',
    'damage_thresholds.major': 'Порог ощутимого урона',
    'damage_thresholds.severe': 'Порог тяжёлого урона',
    'attack': 'Бонус атаки',
    'proficiency': 'Мастерство',
    'damage': 'Бонус урона',
    'spell_bonus': 'Характеристика заклинателя',
    'loadout': 'Инвентарь'
  }
}
const VARIABLES_LIST = ['str', 'agi', 'fin', 'ins', 'pre', 'know', 'level', 'no_armor', 'no_weapon', 'proficiency', 'tier', 'stress_marked', 'health_marked', 'spellcast'];

export const DaggerheartBonuses = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [locale] = useAppLocale();

  const WarningComponent = () => (
    <div class="warning">
      <p class="text-black">{localize(TRANSLATION, locale()).warning}</p>
    </div>
  );

  const saveBonus = async (bonuses, comment) => {
    return await createCharacterBonusRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { bonus: { comment: comment, value: bonuses } }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBonuses' }}>
      <GuideWrapper character={character()}>
        <SharedBonusesV2
          character={character()}
          mapping={localize(MAPPING, locale())}
          variablesList={VARIABLES_LIST}
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
          warningComponent={WarningComponent}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
