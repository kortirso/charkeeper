import { For } from 'solid-js';

import { Pathfinder2SharedHealth } from '../../../../pages';
import { ErrorWrapper, Checkbox } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    dyingConditionValue: 'Dying condition value'
  },
  ru: {
    dyingConditionValue: 'Состояние при смерти'
  },
  es: {
    dyingConditionValue: 'Valor de la condición de muerte'
  }
}

export const Pathfinder2Health = (props) => {
  const character = () => props.character;

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  const changeHealth = (coefficient, value) => {
    const damageValue = parseInt(value) || 0;
    if (damageValue === 0) return;

    const payload = { health: { ...character().health } };
    if (coefficient === 1) {
      payload.health.current = Math.min(character().health.current + damageValue, character().health.max)
    } else {
      if (character().health.temp >= damageValue) {
        payload.health.temp = character().health.temp - damageValue;
      } else {
        const realDamage = damageValue - character().health.temp;
        payload.health.temp = 0;
        payload.health.current = Math.max(character().health.current - realDamage, 0);
      }
    }
    replaceCharacter(payload);
  }

  const changeTempHealth = (value) => {
    const payload = { health: { ...character().health, temp: character().health.temp + value } };

    replaceCharacter(payload);
  }

  const gainDying = () => replaceCharacter({ dying_condition_value: character().dying_condition_value + 1 });

  const restoreDying = () => {
    const newValue = character().dying_condition_value > 0 ? (character().dying_condition_value - 1) : 0;
    const payload = { dying_condition_value: newValue };

    replaceCharacter(payload);    
  }

  const replaceCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );
    performResponse(
      result,
      function() { // eslint-disable-line solid/reactivity
        props.onReplaceCharacter(payload);
      },
      function() { renderAlerts(result.errors_list) }
    );
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Health' }}>
      <Pathfinder2SharedHealth
        currentHealth={character().health.current}
        maxHealth={character().health.max}
        tempHealth={character().health.temp}
        onChangeHealth={changeHealth}
        onChangeTempHealth={changeTempHealth}
      >
        <div class="flex items-center pt-0 p-4">
          <p class="mr-2">{localize(TRANSLATION, locale()).dyingConditionValue}</p>
          <div class="flex">
            <For each={[...Array((character().dying_condition_value || 0))]}>
              {() =>
                <Checkbox checked classList="mr-1" onToggle={restoreDying} />
              }
            </For>
            <For each={[...Array(character().max_dying - (character().dying_condition_value || 0))]}>
              {() =>
                <Checkbox classList="mr-1" onToggle={gainDying} />
              }
            </For>
          </div>
        </div>
      </Pathfinder2SharedHealth>
    </ErrorWrapper>
  );
}
