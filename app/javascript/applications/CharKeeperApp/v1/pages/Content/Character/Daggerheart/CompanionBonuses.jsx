import { ErrorWrapper, SharedBonusesV2 } from '../../../../components';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    warning: "Formula can contain math expressions and some variables. For example, '2', '-1', '2 * level'."
  },
  ru: {
    warning: "Формула может содержать математические выражения и переменные. Например, '2', '-1', '2 * level'."
  },
  es: {
    warning: "La fórmula puede contener expresiones matemáticas y variables. Por ejemplo, '2', '-1', '2 * level'."
  }
}

const MAPPING = {
  en: {
    'stress_max': 'Stress',
    'evasion': 'Evasion',
    'damage_bonus': 'Damage'
  },
  ru: {
    'stress_max': 'Стресс',
    'evasion': 'Уклонение',
    'damage_bonus': 'Урон'
  }
}
const ONLY_ADD = ['stress_max', 'evasion', 'damage_bonus'];
const VARIABLES_LIST = ['level'];

export const DaggerheartCompanionBonuses = (props) => {
  const companion = () => props.companion;

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
      companion().provider,
      companion().id,
      { bonus: { comment: comment, value: bonuses } }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: companion().id, key: 'DaggerheartCompanionBonuses' }}>
      <SharedBonusesV2
        character={companion()}
        mapping={localize(MAPPING, locale())}
        noVariables={[]}
        onlyAdd={ONLY_ADD}
        variablesList={VARIABLES_LIST}
        onSaveBonus={saveBonus}
        onReloadCharacter={props.refreshCompanion}
        warningComponent={WarningComponent}
      />
    </ErrorWrapper>
  );
}
