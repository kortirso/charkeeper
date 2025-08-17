import { createSignal, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { IconButton } from '../../../components';
import { Dots, Avatar } from '../../../assets';
import { useAppLocale } from '../../../context';
import { clickOutside } from '../../../helpers';

export const CharactersListItem = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const toggleMenu = (event) => {
    event.stopPropagation();
    setIsOpen(!isOpen());
  }

  const viewClick = (event) => {
    event.stopPropagation();
    props.onViewClick();
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
      <div class="mr-3 pb-4 dark:text-snow">
        <Show
          when={props.avatar}
          fallback={<Avatar width={64} height={64} />}
        >
          <img src={props.avatar} class="w-16 h-16 rounded" />
        </Show>
      </div>
      <div
        class="flex-1 flex pb-4 pr-4"
        classList={{
          'border-b border-gray-200 dark:border-dusty': !props.isActive,
          'border-b border-blue-400 dark:border-fuzzy-red': props.isActive
        }}>
        <div class="flex-1">
          <div class="flex">
            <p class="font-normal! text-lg dark:text-snow" classList={{ 'text-white': props.isActive }}>
              {props.name}
            </p>
          </div>
          <p class="text-xs/4 text-gray-400 dark:text-gray-300" classList={{ 'text-white': props.isActive }}>
            {props.firstText}
          </p>
          <p class="text-xs/4 text-gray-400 dark:text-gray-300" classList={{ 'text-white': props.isActive }}>
            {props.secondText}
          </p>
        </div>
        <div class="relative h-16 dark:text-snow" use:clickOutside={() => setIsOpen(false)}>
          <IconButton onClick={toggleMenu}>
            <Dots />
          </IconButton>
          <Show when={isOpen()}>
            <div class="absolute right-0 border border-gray-200 rounded overflow-hidden">
              <p
                class="px-2 py-1 text-sm bg-white hover:bg-gray-200 dark:bg-dusty dark:hover:bg-neutral-800"
                onClick={props.onDeleteCharacter} // eslint-disable-line solid/reactivity
              >{t('charactersPage.onDeleteCharacter')}</p>
            </div>
          </Show>
        </div>
      </div>
      <Show when={props.onViewClick && !window.__TAURI_INTERNALS__}>
        <p class="absolute bottom-0 right-0 px-2 py-1 dark:text-snow" onClick={(e) => viewClick(e)}>
          PDF
        </p>
      </Show>
    </div>
  );
}
