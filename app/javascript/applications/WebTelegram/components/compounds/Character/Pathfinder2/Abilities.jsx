import { createSignal, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../molecules';
import { Button } from '../../../atoms';

import { useAppLocale, useAppAlert } from '../../../../context';
import { PlusSmall, Minus } from '../../../../assets';

import { modifier } from '../../../../../../helpers';

export const Pathfinder2Abilities = (props) => {
  // changeable data
  const [abilitiesData, setAbilitiesData] = createSignal(props.initialAbilities);

  const { Modal, openModal, closeModal } = createModal();
  const [{ renderAlerts }] = useAppAlert();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const decreaseAbilityValue = (slug) => {
    if (abilitiesData[slug] === 1) return;
    setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] - 1 });
  }

  const increaseAbilityValue = (slug) => setAbilitiesData({ ...abilitiesData(), [slug]: abilitiesData()[slug] + 1 });

  // submits
  const updateAbilities = async () => {
    const result = await props.onReloadCharacter({ abilities: abilitiesData() });
    if (result.errors === undefined) closeModal();
    else renderAlerts(result.errors);
  }

  return (
    <>
      <For each={Object.entries(dict().dnd.abilities)}>
        {([slug, ability]) =>
          <div class="flex items-start mb-2">
            <div
              class="white-box flex flex-col items-center w-2/5 p-2 cursor-pointer"
              onClick={openModal}
            >
              <p class="text-sm mb-1">{ability} {props.initialAbilities[slug]}</p>
              <p class="text-2xl mb-1">{modifier(props.modifiers[slug])}</p>
            </div>
            <div class="w-3/5 pl-4" />
          </div>
        }
      </For>
      <Modal>
        <div class="white-box p-4 flex flex-col">
          <For each={Object.entries(dict().dnd.abilities)}>
            {([slug, ability]) =>
              <div class="mb-4 flex items-center">
                <p class="flex-1 text-sm text-left">{ability}</p>
                <div class="flex justify-between items-center ml-4 w-32">
                  <Button default size="small" onClick={() => decreaseAbilityValue(slug)}>
                    <Minus />
                  </Button>
                  <p>{abilitiesData()[slug]}</p>
                  <Button default size="small" onClick={() => increaseAbilityValue(slug)}>
                    <PlusSmall />
                  </Button>
                </div>
              </div>
            }
          </For>
          <Button default textable onClick={updateAbilities}>{t('save')}</Button>
        </div>
      </Modal>
    </>
  );
}
