import { createSignal, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { IconButton } from '../../atoms';

import { Dots } from '../../../assets';
import { useAppLocale } from '../../../context';

import { clickOutside } from '../../../../../helpers';

export const Item = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const toggleMenu = (event) => {
    event.stopPropagation();

    setIsOpen(!isOpen());
  }

  return (
    <div
      class="mb-3 p-3 flex items-center white-box cursor-pointer"
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <div class="mr-3">
        <Show when={props.avatar} fallback={<div class="w-16 h-16 bordered" />}>
          <img src={props.avatar} class="w-16 h-16 rounded-full" />
        </Show>
      </div>
      <div class="flex-1">
        <div class="flex">
          <p class="font-cascadia text-lg">{props.name}</p>
          <span class="text-xs/4 font-cascadia-light text-gray-400 ml-2">{props.provider}</span>
        </div>
        <p class="text-xs/4 font-cascadia-light text-gray-400">
          {props.firstText}
        </p>
        <p class="text-xs/4 font-cascadia-light text-gray-400">
          {props.secondText}
        </p>
      </div>
      <div class="relative h-16" use:clickOutside={() => setIsOpen(false)}>
        <IconButton onClick={toggleMenu}>
          <Dots />
        </IconButton>
        <Show when={isOpen()}>
          <div class="absolute right-0 border border-gray-200 rounded">
            <p
              class="px-2 py-1 text-sm hover:bg-gray-200"
              onClick={props.onDeleteCharacter} // eslint-disable-line solid/reactivity
            >{t('charactersPage.onDeleteCharacter')}</p>
          </div>
        </Show>
      </div>
    </div>
  );
}
