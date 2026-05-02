import { ErrorWrapper, GuideWrapper, SharedBonusesV2 } from '../../../../components';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    warning: "Formula can contain math expressions and some variables. For example, '2', '-1', '2 * level'. There are integrated functions: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c)"
  },
  ru: {
    warning: "Формула может содержать математические выражения и переменные. Например, '2', '-1', '2 * level'. Также есть встроенные функции: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c)"
  }
}

const MAPPING = {
  en: {
    'str': 'Strength',
    'spd': 'Speed',
    'int': 'Intellect',
    'wil': 'Willpower',
    'awa': 'Awareness',
    'pre': 'Presence',
    'defense.physical': 'Physical defense',
    'defense.cognitive': 'Cognitive defense',
    'defense.spiritual': 'Spiritual defense',
    'deflect': 'Deflect',
    'health_max': 'Health',
    'focus_max': 'Focus',
    'investiture_max': 'Investiture',
    'movement': 'Movement',
    'attack': 'Attack',
    'melee_attacks': 'Melee attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'melee_damage': 'Melee damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Strength',
    'spd': 'Speed',
    'int': 'Intellect',
    'wil': 'Willpower',
    'awa': 'Awareness',
    'pre': 'Presence',
    'defense.physical': 'Physical defense',
    'defense.cognitive': 'Cognitive defense',
    'defense.spiritual': 'Spiritual defense',
    'deflect': 'Deflect',
    'health_max': 'Health',
    'focus_max': 'Focus',
    'investiture_max': 'Investiture',
    'movement': 'Movement',
    'attack': 'Attack',
    'melee_attacks': 'Melee attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'melee_damage': 'Melee damage',
    'range_damage': 'Range damage'
  },
  es: {
    'str': 'Strength',
    'spd': 'Speed',
    'int': 'Intellect',
    'wil': 'Willpower',
    'awa': 'Awareness',
    'pre': 'Presence',
    'defense.physical': 'Physical defense',
    'defense.cognitive': 'Cognitive defense',
    'defense.spiritual': 'Spiritual defense',
    'deflect': 'Deflect',
    'health_max': 'Health',
    'focus_max': 'Focus',
    'investiture_max': 'Investiture',
    'movement': 'Movement',
    'attack': 'Attack',
    'melee_attacks': 'Melee attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'melee_damage': 'Melee damage',
    'range_damage': 'Range damage'
  }
}
const NO_VARIABLES = ['str', 'spd', 'int', 'wil', 'awa', 'pre'];
const ONLY_ADD = [
  'str', 'spd', 'int', 'wil', 'awa', 'pre', 'attack', 'damage', 'health_max', 'focus_max', 'investiture_max',
  'defense.physical', 'defense.cognitive', 'defense.spiritual', 'deflect', 'movement',
  'melee_attacks', 'range_attacks', 'melee_damage', 'range_damage'
];
const VARIABLES_LIST = ['str', 'spd', 'int', 'wil', 'awa', 'pre', 'level', 'tier'];

export const CosmereBonuses = (props) => {
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereBonuses' }}>
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
