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
    'int': 'Intelligence',
    'wil': 'Will',
    'initiative': 'Initiative',
    'health.max': 'Max health'
  },
  ru: {
    'str': 'Сила',
    'dex': 'Ловкость',
    'int': 'Интеллект',
    'wil': 'Воля',
    'initiative': 'Инициатива',
    'health.max': 'Здоровье'
  }
}
const VARIABLES_LIST = ['str', 'dex', 'int', 'wil', 'level', 'no_armor'];

export const NimbleBonuses = (props) => {
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleBonuses' }}>
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
