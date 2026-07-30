import { createSignal, createEffect, createMemo, For, Show, batch } from 'solid-js';

import { Pathfinder2SharedHealth } from '../../../../pages';
import { StatsBlock, ErrorWrapper, GuideWrapper, Dice, Checkbox, EditWrapper, Input, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { modifier, localize, performResponse } from '../../../../helpers';

const TRANSLATION = {
  en: {
    armor: 'Armor value',
    initiative: 'Initiative',
    speed: 'Speed',
    wounds: 'Wounds',
    changeMaxHp: 'Change max HP',
    hitDices: 'Hit Dices',
    armorValue: 'Armor',
    shieldValue: 'Shield',
    separateShield: 'Separate shield damage reduce'
  },
  ru: {
    armor: 'Броня',
    initiative: 'Инициатива',
    speed: 'Скорость',
    wounds: 'Раны',
    changeMaxHp: 'Изменить максимальное здоровье',
    hitDices: 'Кости хитов',
    armorValue: 'Доспех',
    shieldValue: 'Щит',
    separateShield: 'Щит блокирует урон отдельно'
  }
}

export const NimbleHealth = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [shieldEditMode, setShieldEditMode] = createSignal(false);
  const [maxHp, setMaxHp] = createSignal(0);
  const [separateShield, setSeparateShield] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setMaxHp(character().health.max);
      setSeparateShield(character().separate_shield);
      setLastActiveCharacterId(character().id);
    });
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const cancelEditing = () => {
    batch(() => {
      setMaxHp(character().health.max);
      setEditMode(false);
    });
  }

  const cancelShieldEditing = () => {
    batch(() => {
      setSeparateShield(character().separate_shield);
      setShieldEditMode(false);
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

  const saveShield = () => {
    setShieldEditMode(false);
    replaceCharacter({ separate_shield: separateShield() });
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

  const renderSeparateArmor = () => (
    <div class="flex gap-4">
      <div>
        <p class="text-center">{character().armor}</p>
        <p class="text-xs">{i18n().armorValue}</p>
      </div>
      <div>
        <p class="text-center">{character().shield}</p>
        <p class="text-xs">{i18n().shieldValue}</p>
      </div>
    </div>
  )

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'NimbleHealth' }}>
      <GuideWrapper character={character()}>
        <EditWrapper
          position="right"
          editMode={shieldEditMode()}
          onSetEditMode={setShieldEditMode}
          onCancelEditing={cancelShieldEditing}
          onSaveChanges={saveShield}
        >
          <Show
            when={!shieldEditMode()}
            fallback={
              <div class="character-info-block mb-2">
                <Checkbox
                  labelText={i18n().separateShield}
                  labelPosition="right"
                  labelClassList="ml-2"
                  checked={separateShield()}
                  onToggle={() => setSeparateShield(!separateShield())}
                />
              </div>
            }
          >
            <StatsBlock
              items={[
                { title: i18n().armor, value: character().separate_shield ? renderSeparateArmor() : (character().armor + character().shield) },
                {
                  title: i18n().initiative,
                  value: 
                    <Dice
                      width="36"
                      height="36"
                      text={modifier(character().initiative)}
                      onClick={() => props.openD20Test('/check initiative self', i18n().initiative, character().initiative)}
                    />
                },
                { title: i18n().speed, value: character().speed }
              ]}
            />
          </Show>
        </EditWrapper>
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
              <div class="flex items-center gap-2 pt-0 p-4">
                <p>{i18n().wounds}</p>
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
              <div class="flex items-center gap-4 pt-0 p-4">
                <p>{i18n().hitDices} (d{character().hit_die})</p>
                <div class="flex gap-2">
                  <Button default size="small" disabled={character().hit_die_spent === character().hit_die_max} onClick={() => replaceCharacter({ hit_die_spent: character().hit_die_spent + 1 })}><Minus /></Button>
                  {character().hit_die_max - character().hit_die_spent} / {character().hit_die_max}
                  <Button default size="small" disabled={character().hit_die_spent === 0} onClick={() => replaceCharacter({ hit_die_spent: character().hit_die_spent - 1 })} ><Plus /></Button>
                </div>
              </div>
            </Pathfinder2SharedHealth>
          </Show>
        </EditWrapper>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
