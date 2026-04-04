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
    'saving_throws_value.fortitude': 'Fortitude',
    'saving_throws_value.reflex': 'Reflex',
    'saving_throws_value.will': 'Will',
    'armor_class': 'Armor Class',
    'perception': 'Perception',
    'speed': 'Speed',
    'attack': 'Attack',
    'unarmed_attacks': 'Unarmed attacks',
    'melee_attacks': 'Melee attacks',
    'thrown_attacks': 'Thrown attacks',
    'range_attacks': 'Range attacks',
    'damage': 'Damage',
    'unarmed_damage': 'Unarmed damage',
    'melee_damage': 'Melee damage',
    'thrown_damage': 'Thrown damage',
    'range_damage': 'Range damage',
    'health.max': 'Health'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'con': 'Выносливость',
    'int': 'Интеллект',
    'wis': 'Мудрость',
    'cha': 'Харизма',
    'saving_throws_value.fortitude': 'Стойкость',
    'saving_throws_value.reflex': 'Реакция',
    'saving_throws_value.will': 'Воля',
    'armor_class': 'Класс брони',
    'perception': 'Восприятие',
    'speed': 'Скорость',
    'attack': 'Атака',
    'unarmed_attacks': 'Безоружные атаки',
    'melee_attacks': 'Рукопашные атаки',
    'thrown_attacks': 'Метательные атаки',
    'range_attacks': 'Дистанционные атаки',
    'damage': 'Урон',
    'unarmed_damage': 'Безоружный урон',
    'melee_damage': 'Рукопашный урон',
    'thrown_damage': 'Метательный урон',
    'range_damage': 'Дистанционный урон',
    'health.max': 'Здоровье'
  }
}
const NO_VARIABLES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
const ONLY_ADD = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'attack', 'damage', 'health.max'];
const VARIABLES_LIST = ['str', 'dex', 'con', 'int', 'wis', 'cha', 'level', 'no_body_armor', 'no_armor'];

export const Pathfinder2Bonuses = (props) => {
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Bonuses' }}>
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
