import { ErrorWrapper, GuideWrapper, SharedBonusesV2 } from '../../../../components';
import { useAppLocale, useAppState } from '../../../../context';
import { createCharacterBonusRequest } from '../../../../requests/createCharacterBonusRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    warning: "Formula can contain math expressions and some variables. For example, '2', '-1', '2 * level'. There are integrated functions: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c). For secondary speeds, if set 0 - speed will be equal base speed."
  },
  ru: {
    warning: "Формула может содержать математические выражения и переменные. Например, '2', '-1', '2 * level'. Также есть встроенные функции: 'if (condition, true_result, false_result)', 'SUM(a, b, c)', MAX(a, b, c). Для вторичных скоростей, если указать 0 - скорость будет равна базовой скорости."
  }
}
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
          mapping={localize(props.mapping, locale())}
          variablesList={VARIABLES_LIST}
          onSaveBonus={saveBonus}
          onReloadCharacter={props.onReloadCharacter}
          warningComponent={WarningComponent}
        />
      </GuideWrapper>
    </ErrorWrapper>
  );
}
