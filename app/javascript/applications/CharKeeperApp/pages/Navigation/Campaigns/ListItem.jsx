import { createSignal, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { IconButton } from '../../../components';
import { Dots } from '../../../assets';
import { useAppLocale } from '../../../context';
import { clickOutside } from '../../../helpers';

export const CampaignsListItem = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const toggleMenu = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen());
  }

  return (
    <div
      class="p-4 pb-0 pr-0 flex items-center cursor-pointer relative"
      classList={{
        'bg-white hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-dusty': !props.isActive,
        'bg-blue-400 dark:bg-fuzzy-red': props.isActive
      }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <div
        class="flex-1 flex pb-4 pr-4"
        classList={{
          'border-b border-gray-200 dark:border-dusty': !props.isActive,
          'border-b border-blue-400 dark:border-fuzzy-red': props.isActive
        }}>
        <div class="flex-1">
          <p class="font-normal! text-lg dark:text-snow" classList={{ 'text-white': props.isActive }}>
            {props.name}
          </p>
        </div>
        <div class="relative h-8" use:clickOutside={() => setIsOpen(false)}>
          <IconButton onClick={toggleMenu}>
            <Dots />
          </IconButton>
          <Show when={isOpen()}>
            <div class="absolute right-0 border border-gray-200 rounded overflow-hidden">
              <p
                class="px-2 py-1 text-sm bg-white hover:bg-gray-200 dark:bg-dusty dark:hover:bg-neutral-800 dark:text-snow"
                onClick={props.onDeleteCampaign} // eslint-disable-line solid/reactivity
              >{t('pages.campaignsPage.onDeleteCampaign')}</p>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
