import { createSignal, For, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal, StatsBlock } from '../../../molecules';
import { Input, Button } from '../../../atoms';

import { useAppState, useAppLocale, useAppAlert } from '../../../../context';

import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const DndGold = (props) => {
  const character = () => props.character;

  const [coinsData, setCoinsData] = createSignal(character().coins);

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateCoins = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
      character().id,
      { character: { coins: coinsData() }, only_head: true }
    );

    if (result.errors === undefined) {
      batch(() => {
        props.onReplaceCharacter({ coins: coinsData() });
        closeModal();
      });
    } else renderAlerts(result.errors);
  }

  return (
    <>
      <StatsBlock
        items={[
          { title: t('equipment.gold'), value: character().coins.gold },
          { title: t('equipment.silver'), value: character().coins.silver },
          { title: t('equipment.copper'), value: character().coins.copper }
        ]}
        onClick={openModal}
      />
      <Modal>
        <For each={['gold', 'silver', 'copper']}>
          {(coin) =>
            <div class="mb-4 flex justify-between items-center">
              <p class="flex-1 text-sm">{t(`equipment.${coin}`)}</p>
              <Input
                numeric
                containerClassList="w-20 ml-4"
                value={coinsData()[coin]}
                onInput={(value) => setCoinsData({ ...coinsData(), [coin]: Number(value) })}
              />
            </div>
          }
        </For>
        <Button default textable onClick={updateCoins}>{t('save')}</Button>
      </Modal>
    </>
  );
}
