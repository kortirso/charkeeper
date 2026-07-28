import { createSignal, createMemo, batch, Show } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Select, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    values: {
      combat_rest: 'After Combat',
      field_rest: 'Field',
      long_field_rest: 'Long field',
      safe_rest: 'Safe'
    },
    valueLabel: 'Select type of rest',
    pointsLabel: 'Spend Rest Poinst',
    description: 'This happens during Exploration but are specific moments when PCs stop to rest and recover their resources.',
    complete: 'Rest is completed',
    rest: 'Make rest',
    makeRolls: 'Roll recovery die',
    lastRecovery: 'Last recovery die roll'
  },
  ru: {
    values: {
      combat_rest: 'После сражения',
      field_rest: 'Отдых в поле',
      long_field_rest: 'Длинный отдых в поле',
      safe_rest: 'Безопасный'
    },
    valueLabel: 'Выберите тип отдыха',
    pointsLabel: 'Потратить очки отдыха',
    description: 'Это происходит во время исследования, но это определенные моменты, когда персонажи останавливаются, чтобы отдохнуть и восстановить свои ресурсы.',
    complete: 'Отдых завершён',
    rest: 'Провести отдых',
    makeRolls: 'Использовать кость восстановления',
    lastRecovery: 'Последнее использование кости восстановления'
  },
  es: {
    values: {
      combat_rest: 'After Combat',
      field_rest: 'Field',
      long_field_rest: 'Long field',
      safe_rest: 'Safe'
    },
    valueLabel: 'Seleccionar tipo de descanso',
    pointsLabel: 'Gastar Puntos de Descanso',
    description: 'Esto sucede durante la Exploración pero son momentos específicos cuando los jugadores se detienen a descansar y recuperar sus recursos.',
    complete: 'El descanso fue completado',
    rest: 'Tomar descanso',
    makeRolls: 'Roll recovery die',
    lastRecovery: 'Last recovery die roll'
  }
}

export const NimbleRest = (props) => {
  const character = () => props.character;

  const [value, setValue] = createSignal(null);
  const [spendRestPoints, setSpendRestPoints] = createSignal(0);
  const [makeRolls, setMakeRolls] = createSignal(false);
  const [recovery, setRecovery] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const restCharacter = async () => {
    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character:
        { value: value(), hit_die_spend: parseInt(spendRestPoints()), hit_die: character().hit_die, make_rolls: makeRolls() }
      }
    );
    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(result.character);
        setRecovery(result.recovery);
        setValue(null);
        setSpendRestPoints(0);
        renderNotice(localize(TRANSLATION, locale()).complete);
      });
    } else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleRest' }}>
      <GuideWrapper character={character()}>
        <div class="character-info-block">
          <p class="mb-4">{i18n().description}</p>
          <Select
            containerClassList="w-full mb-4"
            labelText={i18n().valueLabel}
            items={i18n().values}
            selectedValue={value()}
            onSelect={setValue}
          />
          <Show when={recovery()}>
            <p class="text-sm mb-4">{localize(TRANSLATION, locale()).lastRecovery} - {recovery()}</p>
          </Show>
          <Show when={['field_rest', 'long_field_rest'].includes(value())}>
            <Select
              containerClassList="w-full mb-4"
              labelText={i18n().pointsLabel}
              items={Array.from([...Array(character().hit_die_max - character().hit_die_spent).keys()], (x) => x + 1).reduce((acc, item) => { acc[item] = item; return acc; }, {})}
              selectedValue={spendRestPoints()}
              onSelect={setSpendRestPoints}
            />
            <Checkbox
              classList="mb-4"
              labelText={`${localize(TRANSLATION, locale()).makeRolls} 1d${character().hit_die}`}
              labelPosition="right"
              labelClassList="ml-2"
              checked={makeRolls()}
              onToggle={() => setMakeRolls(!makeRolls())}
            />
          </Show>
          <Button default textable onClick={restCharacter}><span>{i18n().rest}</span></Button>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
