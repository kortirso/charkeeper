import { createSignal, createMemo } from 'solid-js';

import { ErrorWrapper, GuideWrapper, Button, Input } from '../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../context';
import { PlusSmall, Minus } from '../../assets';
import { updateCharacterRequest } from '../../requests/updateCharacterRequest';
import { localize } from '../../helpers';

const TRANSLATION = {
  en: {
    money: 'Money',
    amount: 'Change',
    negativeMoney: 'Money can not be negative',
    tooMuchMoney: 'Too much money :)'
  },
  ru: {
    money: 'Деньги',
    amount: 'Изменение',
    negativeMoney: 'Деньги не могут быть отрицательными',
    tooMuchMoney: 'Указано слишком много денег :)'
  },
  es: {
    money: 'Money',
    amount: 'Change',
    negativeMoney: 'El dinero no puede ser negativo',
    tooMuchMoney: 'Demasiado dinero :)'
  }
}

export const GoldSingle = (props) => {
  const character = () => props.character;

  const [coinsChange, setCoinsChange] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts, renderAlert }] = useAppAlert();
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const updateMoney = async (value) => {
    const moneyChange = coinsChange() * value;
    const newAmount = character().money + moneyChange;
    if (newAmount < 0) return renderAlert(i18n().negativeMoney);
    if (newAmount > 100000000) return renderAlert(i18n().tooMuchMoney);

    const payload = { money: newAmount };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'GoldSingle' }}>
      <GuideWrapper character={character()}>
        <div class="blockable blockable-padding mb-2 flex items-center">
          <div class="flex-1 flex flex-col items-center">
            <p class="uppercase text-sm mb-1">{i18n().money}</p>
            <p class="text-2xl">{character().money}</p>
          </div>
          <div class="flex-1 flex items-center gap-x-4">
            <Button default classList="mt-6" size="small" onClick={() => updateMoney(-1)}><Minus /></Button>
            <Input
              numeric
              containerClassList="w-20"
              labelText={i18n().amount}
              value={coinsChange()}
              onInput={setCoinsChange}
            />
            <Button default classList="mt-6" size="small" onClick={() => updateMoney(1)}><PlusSmall /></Button>
          </div>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
