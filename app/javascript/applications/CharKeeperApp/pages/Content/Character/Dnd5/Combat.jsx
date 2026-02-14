import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  createModal, StatsBlock, ErrorWrapper, Input, Toggle, Checkbox, Button, GuideWrapper, Dice
} from '../../../../components';
import { useAppState, useAppLocale } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { createCharacterHealthRequest } from '../../../../requests/createCharacterHealthRequest';
import { modifier, localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    flight: 'Flight speeds',
    swim: 'Swim speed',
    climb: 'Climb speed',
    check: 'Initiative'
  },
  ru: {
    flight: 'Скорость полёта',
    swim: 'Скорость плавания',
    climb: 'Скорость лазания',
    check: 'Инициатива'
  }
}

export const Dnd5Combat = (props) => {
  const character = () => props.character;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [damageConditions, setDamageConditions] = createSignal(character().resistances);
  const [damageHealValue, setDamageHealValue] = createSignal(0);
  const [healthData, setHealthData] = createSignal(character().health);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setDamageConditions(character().resistances);
      setHealthData(character().health);
      setLastActiveCharacterId(character().id);
    });
  });

  // actions
  const toggleDamageCondition = async (damageType, slug) => {
    const newValue = { ...damageConditions() };
    if (newValue[damageType].includes(slug)) {
      newValue[damageType] = newValue[damageType].filter((item) => item !== slug)
    } else {
      newValue[damageType] = newValue[damageType].concat(slug)
    }

    const result = await props.onRefreshCharacter(newValue);
    if (result.errors_list === undefined) setDamageConditions(newValue);
  }

  // submits
  const gainDeath = async (type) => {
    let newValue;
    if (character().death_saving_throws[type]) {
      newValue = { ...character().death_saving_throws, [type]: character().death_saving_throws[type] + 1 };
    } else {
      newValue = { ...character().death_saving_throws, [type]: 1 };
    }

    const payload = { death_saving_throws: newValue };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
  }

  const freeDeath = async (type) => {
    const newValue = { ...character().death_saving_throws, [type]: character().death_saving_throws[type] - 1 };
    const payload = { death_saving_throws: newValue };
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter(payload);
  }

  const changeHealth = async (coefficient) => {
    const result = await createCharacterHealthRequest(
      appState.accessToken,
      'dnd5',
      character().id,
      { value: damageHealValue() * coefficient, only: 'health,death_saving_throws' }
    );

    if (result.errors_list === undefined) {
      props.onReplaceCharacter({
        health: result.character.health,
        death_saving_throws: result.character.death_saving_throws
      });
    }
  }

  const updateHealth = async () => {
    const payload = { health: healthData() };

    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) {
      batch(() => {
        props.onReplaceCharacter(payload);
        closeModal();
      });
    }
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Combat' }}>
      <GuideWrapper character={character()}>
        <StatsBlock
          items={[
            { title: t('terms.armorClass'), value: character().armor_class },
            {
              title: t('terms.initiative'),
              value: 
                <Dice
                  width="36"
                  height="36"
                  text={modifier(character().initiative)}
                  onClick={() => props.openDiceRoll('/check initiative empty', character().initiative, localize(TRANSLATION, locale())['check'])}
                />
              
            },
            { title: t('terms.speed'), value: character().speed }
          ]}
        >
          <Show when={Object.keys(character().speeds).length > 0}>
            <div class="pt-0 p-4">
              <For each={Object.entries(character().speeds)}>
                {([slug, value]) =>
                  <p class="dark:text-snow text-sm">{localize(TRANSLATION, locale())[slug]} - {value}</p>
                }
              </For>
            </div>
          </Show>
        </StatsBlock>
        <StatsBlock
          items={[
            { title: t('terms.health.current'), value: character().health.current },
            { title: t('terms.health.max'), value: character().health.max },
            { title: t('terms.health.temp'), value: character().health.temp }
          ]}
          onClick={openModal}
        >
          <div class="flex items-center pt-0 p-4">
            <Button default textable classList="flex-1" onClick={() => changeHealth(-1)}>
              {t('character.damage')}
            </Button>
            <Input
              numeric
              containerClassList="w-20 mx-4"
              value={damageHealValue()}
              onInput={(value) => setDamageHealValue(Number(value))}
            />
            <Button default textable classList="flex-1" onClick={() => changeHealth(1)}>
              {t('character.heal')}
            </Button>
          </div>
          <div class="pt-0 p-4">
            <p class="mb-2 dark:text-snow">{t('character.deathSavingThrows')}</p>
            <div class="flex mb-2">
              <p class="dark:text-snow w-20">{t('character.deathSuccess')}</p>
              <div class="flex">
                <For each={[...Array((character().death_saving_throws.success || 0))]}>
                  {() =>
                    <Checkbox
                      checked
                      classList="mr-1"
                      onToggle={() => freeDeath('success')}
                    />
                  }
                </For>
                <For each={[...Array(3 - (character().death_saving_throws.success || 0))]}>
                  {() =>
                    <Checkbox
                      classList="mr-1"
                      onToggle={() => gainDeath('success')}
                    />
                  }
                </For>
              </div>
            </div>
            <div class="flex">
              <p class="dark:text-snow w-20">{t('character.deathFailure')}</p>
              <div class="flex">
                <For each={[...Array((character().death_saving_throws.failure || 0))]}>
                  {() =>
                    <Checkbox
                      checked
                      classList="mr-1"
                      onToggle={() => freeDeath('failure')}
                    />
                  }
                </For>
                <For each={[...Array(3 - (character().death_saving_throws.failure || 0))]}>
                  {() =>
                    <Checkbox
                      classList="mr-1"
                      onToggle={() => gainDeath('failure')}
                    />
                  }
                </For>
              </div>
            </div>
          </div>
        </StatsBlock>
        <Toggle title={t('character.damageConditions')}>
          <table class="table w-full first-column-full-width">
            <thead>
              <tr>
                <td />
                <td class="text-sm uppercase px-1">{t('character.vulnerability')}</td>
                <td class="text-sm uppercase px-1">{t('character.resistance')}</td>
                <td class="text-sm uppercase px-1">{t('character.immunity')}</td>
              </tr>
            </thead>
            <tbody>
              <For each={Object.entries(dict().damage)}>
                {([slug, damage]) =>
                  <tr>
                    <td>{damage}</td>
                    <td>
                      <Checkbox
                        checked={damageConditions().vulnerability.includes(slug)}
                        onToggle={() => toggleDamageCondition('vulnerability', slug)}
                      />
                    </td>
                    <td>
                      <Checkbox
                        checked={damageConditions().resistance.includes(slug)}
                        onToggle={() => toggleDamageCondition('resistance', slug)}
                      />
                    </td>
                    <td>
                      <Checkbox
                        checked={damageConditions().immunity.includes(slug)}
                        onToggle={() => toggleDamageCondition('immunity', slug)}
                      />
                    </td>
                  </tr>
                }
              </For>
            </tbody>
          </table>
        </Toggle>
        <Modal>
          <div class="flex flex-col">
            <For each={['max', 'temp']}>
              {(health) =>
                <div class="mb-4 flex items-center">
                  <p class="flex-1 text-sm text-left">{t(`terms.health.${health}`)}</p>
                  <Input
                    numeric
                    containerClassList="w-20 ml-8"
                    value={healthData()[health]}
                    onInput={(value) => setHealthData({ ...healthData(), [health]: Number(value) })}
                  />
                </div>
              }
            </For>
            <Button default textable onClick={updateHealth}>{t('save')}</Button>
          </div>
        </Modal>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
