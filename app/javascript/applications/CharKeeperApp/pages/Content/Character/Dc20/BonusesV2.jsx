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
    'mig': 'Might',
    'agi': 'Agility',
    'int': 'Intelligence',
    'cha': 'Charisma',
    'attribute_saves.mig': 'Might save',
    'attribute_saves.agi': 'Agility save',
    'attribute_saves.int': 'Intelligence save',
    'attribute_saves.cha': 'Charisma save',
    'pd_base': 'Precision defense',
    'ad_base': 'Area defense',
    'initiative': 'Initiative',
    'speeds.ground': 'Speed',
    'speeds.swim': 'Swim speed',
    'speeds.climb': 'Climb speed',
    'speeds.flight': 'Flight speed',
    'speeds.glide': 'Glide speed',
    'attack': 'Attack',
    'damage': 'Damage',
    'max_stamina_points': 'Max stamina points',
    'max_mana_points': 'Max mana points',
    'maneuver_points': 'Maneuver points',
    'max_health': 'Health points',
    'spells': 'Spells amount'
  },
  ru: {
    'mig': 'Мощь',
    'agi': 'Ловкость',
    'int': 'Интеллект',
    'cha': 'Харизма',
    'attribute_saves.mig': 'Мощь спас',
    'attribute_saves.agi': 'Ловкость спас',
    'attribute_saves.int': 'Интеллект спас',
    'attribute_saves.cha': 'Харизма спас',
    'pd_base': 'Точечная защита',
    'ad_base': 'Площадная защита',
    'initiative': 'Инициатива',
    'speeds.ground': 'Скорость',
    'speeds.swim': 'Swim speed',
    'speeds.climb': 'Climb speed',
    'speeds.flight': 'Flight speed',
    'speeds.glide': 'Glide speed',
    'attack': 'Attack',
    'damage': 'Damage',
    'max_stamina_points': 'Очки выносливости',
    'max_mana_points': 'Очки маны',
    'maneuver_points': 'Maneuver points',
    'max_health': 'Очки здоровья',
    'spells': 'Spells amount'
  }
}
const NO_VARIABLES = [];
const ONLY_ADD = [
  'mig', 'agi', 'int', 'cha', 'attribute_saves.mig', 'attribute_saves.agi', 'attribute_saves.int', 'attribute_saves.cha',
  'pd_base', 'ad_base', 'initiative', 'attack', 'damage', 'max_stamina_points', 'max_mana_points', 'maneuver_points',
  'max_health', 'spells'
];
const VARIABLES_LIST = ['mig', 'agi', 'int', 'cha', 'prime', 'level', 'combat_mastery', 'no_armor'];

export const Dc20BonusesV2 = (props) => {
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dc20BonusesV2' }}>
      <GuideWrapper character={character()}>
        <SharedBonusesV2
          character={character()}
          mapping={localize(MAPPING, locale())}
          noVariables={NO_VARIABLES}
          onlyAdd={ONLY_ADD}
          variablesList={VARIABLES_LIST}
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
          warningComponent={WarningComponent}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
