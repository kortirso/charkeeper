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
    'dex': 'Dexterity',
    'con': 'Constitution',
    'int': 'Intelligence',
    'wis': 'Wisdom',
    'cha': 'Charisma',
    'save_dc.str': 'Strength saving throw',
    'save_dc.dex': 'Dexterity saving throw',
    'save_dc.con': 'Constitution saving throw',
    'save_dc.int': 'Intelligence saving throw',
    'save_dc.wis': 'Wisdom saving throw',
    'save_dc.cha': 'Charisma saving throw',
    'armor_class': 'Armor Class',
    'initiative': 'Initiative',
    'speed': 'Speed',
    'speeds.swim': 'Swim speed',
    'speeds.flight': 'Flight speed',
    'speeds.climb': 'Climb speed',
    'attack': 'Attack',
    'unarmed_attacks': 'Unarmed attacks',
    'melee_attacks': 'Melee attacks',
    'thrown_attacks': 'Thrown attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'unarmed_damage': 'Unarmed damage',
    'melee_damage': 'Melee damage',
    'thrown_damage': 'Thrown damage',
    'range_damage': 'Range damage'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Телосложение',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'save_dc.str': 'Сила спасбросок',
    'save_dc.dex': 'Ловкость спасбросок',
    'save_dc.con': 'Телосложение спасбросок',
    'save_dc.int': 'Интеллект спасбросок',
    'save_dc.wis': 'Мудрость спасбросок',
    'save_dc.cha': 'Харизма спасбросок',
    'armor_class': 'Класс брони',
    'initiative': 'Инициатива',
    'speed': 'Скорость',
    'speeds.swim': 'Скорость плавания',
    'speeds.flight': 'Скорость полёта',
    'speeds.climb': 'Скорость лазания',
    'attack': 'Атака',
    'unarmed_attacks': 'Безоружные атаки',
    'melee_attacks': 'Рукопашные атаки',
    'thrown_attacks': 'Метательные атаки',
    'range_attacks': 'Дистанционные атаки',
    'damage': 'Урон',
    'unarmed_damage': 'Безоружный урон',
    'melee_damage': 'Рукопашный урон',
    'thrown_damage': 'Метательный урон',
    'range_damage': 'Дистанционный урон'
  }
}
const NO_VARIABLES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ONLY_ADD = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'attack', 'damage'];
const VARIABLES_LIST = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'proficiency_bonus', 'level', 'no_body_armor', 'no_armor', 'paladin_level'];

export const Dnd2024Bonuses = (props) => {
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd2024Bonuses' }}>
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
