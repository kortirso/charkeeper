import { createSignal, For, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Checkbox, Button } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { createCharacterHealthRequest } from '../../../../requests/createCharacterHealthRequest';

export const Pathfinder2Combat = (props) => {
  const character = () => props.character;

  // changeable data
  const [damageHealValue, setDamageHealValue] = createSignal(0);
  const [healthData, setHealthData] = createSignal(character().health);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const { Modal, openModal, closeModal } = createModal();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // submits
  const updateHealth = () => {
    replaceCharacter({ health: healthData() });
  }

  const changeHealth = async (coefficient) => {
    const result = await createCharacterHealthRequest(
      appState.accessToken,
      'pathfinder2',
      character().id,
      { value: damageHealValue() * coefficient, only: 'health,dying_condition_value' }
    );

    if (result.errors === undefined) {
      props.onReplaceCharacter({
        health: result.character.health,
        dying_condition_value: result.character.dying_condition_value
      });
    } else renderAlerts(result.errors);
  }

  const gainDying = () => {
    replaceCharacter({ dying_condition_value: character().dying_condition_value + 1 });
  }

  const restoreDying = () => {
    const newValue = character().dying_condition_value > 0 ? (character().dying_condition_value - 1) : 0;
    const payload = { dying_condition_value: newValue };

    replaceCharacter(payload);    
  }

  const replaceCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, 'pathfinder2', character().id, { character: payload, only_head: true }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter(payload);
        closeModal();
      });
    } else renderAlerts(result.errors);
  }

  return (
    <>
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
          <div class="flex items-center">
            <p class="mr-2">{t('character.dyingConditionValue')}</p>
            <div class="flex">
              <For each={[...Array((character().dying_condition_value || 0))]}>
                {() =>
                  <Checkbox checked classList="mr-1" onToggle={restoreDying} />
                }
              </For>
              <For each={[...Array(4 - (character().dying_condition_value || 0))]}>
                {() =>
                  <Checkbox classList="mr-1" onToggle={gainDying} />
                }
              </For>
            </div>
          </div>
        </div>
      </StatsBlock>
      <Modal>
        <div class="white-box p-4 flex flex-col">
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
    </>
  );
}
