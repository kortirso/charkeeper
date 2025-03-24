import { createSignal, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../molecules';
import { IconButton, Button } from '../../../atoms';

import { useAppLocale, useAppAlert } from '../../../../context';
import { Plus, Minus } from '../../../../assets';

import { modifier } from '../../../../../../helpers';

export const DaggerheartTraits = (props) => {
  // changeable data
  const [traitsData, setTraitsData] = createSignal(props.initialTraits);

  const { Modal, openModal, closeModal } = createModal();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const decreaseAbilityValue = (slug) => {
    if (traitsData[slug] === 1) return;
    setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setTraitsData({ ...traitsData(), [slug]: traitsData()[slug] + 1 });

  // submits
  const updateAbilities = async () => {
    const result = await props.onReloadCharacter({ traits: traitsData() });
    if (result.errors === undefined) closeModal();
    else renderAlerts(result.errors);
  }

  return (
    <>
      <div class="white-box flex flex-wrap cursor-pointer p-2" onClick={openModal}>
        <For each={Object.entries(dict().daggerheart.traits)}>
          {([slug, ability]) =>
            <div class="flex flex-col items-center w-1/3 p-2">
              <p class="text-sm mb-1">{ability}</p>
              <p class="text-2xl mb-1">{modifier(props.initialTraits[slug])}</p>
            </div>
          }
        </For>
      </div>
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <For each={Object.entries(dict().daggerheart.traits)}>
            {([slug, ability]) =>
              <div class="mb-4 flex items-center">
                <p class="flex-1 text-sm text-left">{ability}</p>
                <div class="flex justify-between items-center ml-4 w-32">
                  <IconButton big onClick={() => decreaseAbilityValue(slug)}>
                    <Minus />
                  </IconButton>
                  <p>{traitsData()[slug]}</p>
                  <IconButton big onClick={() => increaseAbilityValue(slug)}>
                    <Plus />
                  </IconButton>
                </div>
              </div>
            }
          </For>
          <Button primary text={t('save')} onClick={updateAbilities} />
        </div>
      </Modal>
    </>
  );
}
