import { createSignal, batch, Show } from 'solid-js';

import { Button, ErrorWrapper, GuideWrapper, Select, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { createCharacterRestRequest } from '../../../../requests/createCharacterRestRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    values: {
      short: 'Short',
      long: 'Long'
    },
    valueLabel: 'Select type of rest',
    description: 'This happens during Exploration but are specific moments when PCs stop to rest and recover their resources.',
    complete: 'Rest is completed',
    rest: 'Make rest',
    makeRolls: 'Roll recovery die',
    lastRecovery: 'Last recovery die roll'
  },
  ru: {
    values: {
      short: 'Короткий',
      long: 'Длинный'
    },
    valueLabel: 'Выберите тип отдыха',
    description: 'Это происходит во время исследования, но это определенные моменты, когда персонажи останавливаются, чтобы отдохнуть и восстановить свои ресурсы.',
    complete: 'Отдых завершён',
    rest: 'Провести отдых',
    makeRolls: 'Использовать кость восстановления',
    lastRecovery: 'Последнее использование кости восстановления'
  },
  es: {
    values: {
      short: 'Corto',
      complete_long: 'Largo'
    },
    valueLabel: 'Seleccionar tipo de descanso',
    description: 'Esto sucede durante la Exploración pero son momentos específicos cuando los jugadores se detienen a descansar y recuperar sus recursos.',
    complete: 'El descanso fue completado',
    rest: 'Tomar descanso',
    makeRolls: 'Roll recovery die',
    lastRecovery: 'Last recovery die roll'
  }
}

export const CosmereRest = (props) => {
  const character = () => props.character;

  const [value, setValue] = createSignal(null);
  const [makeRolls, setMakeRolls] = createSignal(false);
  const [recovery, setRecovery] = createSignal(null);

  const [appState] = useAppState();
  const [{ renderNotice, renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const restCharacter = async () => {
    if (!value()) return;

    const result = await createCharacterRestRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { rest: { value: value(), make_rolls: makeRolls(), recovery_die: character().recovery_die, health_max: character().health_max, focus_max: character().focus_max } }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        batch(() => {
          props.onReplaceCharacter(result.character);
          setRecovery(result.recovery);
          setValue(null);
          setMakeRolls(false);
          renderNotice(localize(TRANSLATION, locale()).complete);
        });
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'CosmereRest' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <p>{localize(TRANSLATION, locale()).description}</p>
          <Select
            containerClassList="w-full mt-4"
            labelText={localize(TRANSLATION, locale()).valueLabel}
            items={localize(TRANSLATION, locale()).values}
            selectedValue={value()}
            onSelect={setValue}
          />
          <Show when={value() === 'short'}>
            <Checkbox
              classList="mt-4"
              labelText={`${localize(TRANSLATION, locale()).makeRolls} 1d${character().recovery_die}`}
              labelPosition="right"
              labelClassList="ml-2"
              checked={makeRolls()}
              onToggle={() => setMakeRolls(!makeRolls())}
            />
          </Show>
          <Show when={recovery()}>
            <p class="text-sm mt-4">{localize(TRANSLATION, locale()).lastRecovery} - {recovery()}</p>
          </Show> 
          <Button default textable classList="mt-4" onClick={restCharacter}>{localize(TRANSLATION, locale()).rest}</Button>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
