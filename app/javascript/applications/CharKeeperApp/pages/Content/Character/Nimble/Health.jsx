import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { Pathfinder2SharedHealth } from '../../../../pages';
import { StatsBlock, ErrorWrapper, GuideWrapper, Dice, Checkbox, EditWrapper, Input } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    armor: 'Armor',
    initiative: 'Initiative',
    speed: 'Speed',
    wounds: 'Wounds',
    changeMaxHp: 'Change max HP'
  },
  ru: {
    armor: 'Броня',
    initiative: 'Инициатива',
    speed: 'Скорость',
    wounds: 'Раны',
    changeMaxHp: 'Изменить максимальное здоровье'
  }
}

export const NimbleHealth = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [maxHp, setMaxHp] = createSignal(0);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    setMaxHp(character().health.max);
    setLastActiveCharacterId(character().id);
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const cancelEditing = () => {
    batch(() => {
      setMaxHp(character().health.max);
      setEditMode(false);
    });
  }

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

  const gainDying = () => replaceCharacter({ wounds_spent: character().wounds_spent + 1 });

  const restoreDying = () => {
    const newValue = character().wounds_spent > 0 ? (character().wounds_spent - 1) : 0;
    const payload = { wounds_spent: newValue };

    replaceCharacter(payload);    
  }

  const saveMaxHp = () => {
    if (maxHp() < character().health.current) return;

    setEditMode(false);
    replaceCharacter({ health: { ...character().health, max: maxHp() } });
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
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleHealth' }}>
      <GuideWrapper character={character()}>
        <StatsBlock
          items={[
            { title: i18n().armor, value: character().armor },
            {
              title: i18n().initiative,
              value: 
                <Dice
                  width="36"
                  height="36"
                  text={modifier(character().initiative)}
                  onClick={() => null}
                />
            },
            { title: i18n().speed, value: character().speed }
          ]}
        />
        <EditWrapper
          position="right"
          editMode={editMode()}
          onSetEditMode={setEditMode}
          onCancelEditing={cancelEditing}
          onSaveChanges={saveMaxHp}
        >
          <Show
            when={!editMode()}
            fallback={
              <div class="character-info-block">
                <Input numeric labelText={i18n().changeMaxHp} value={maxHp()} onInput={setMaxHp} />
              </div>
            }
          >
            <Pathfinder2SharedHealth
              currentHealth={character().health.current}
              maxHealth={character().health.max}
              tempHealth={character().health.temp}
              onChangeHealth={changeHealth}
              onChangeTempHealth={changeTempHealth}
            >
              <div class="flex items-center pt-0 p-4">
                <p class="mr-2">{i18n().wounds}</p>
                <div class="flex">
                  <For each={[...Array(character().wounds_spent)]}>
                    {() =>
                      <Checkbox checked classList="mr-1" onToggle={restoreDying} />
                    }
                  </For>
                  <For each={[...Array(character().wounds_max - character().wounds_spent)]}>
                    {() =>
                      <Checkbox classList="mr-1" onToggle={gainDying} />
                    }
                  </For>
                </div>
              </div>
            </Pathfinder2SharedHealth>
          </Show>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
