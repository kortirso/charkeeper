import { createSignal, createMemo, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { IconButton } from '../../../components';
import { Dots, Avatar } from '../../../assets';
import pathfinder2Config from '../../../data/pathfinder2.json';
import dnd2024Config from '../../../data/dnd2024.json';
import dnd5Config from '../../../data/dnd5.json';
import dc20Config from '../../../data/dc20.json';
import falloutConfig from '../../../data/fallout.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../context';
import { clickOutside, copyToClipboard, localize } from '../../../helpers';

const AVAILABLE_JSON = ['daggerheart'];
const AVAILABLE_PDF = ['daggerheart', 'dnd5', 'dnd2024', 'pathfinder2'];
const AVAILABLE_RESET = ['daggerheart'];
const TRANSLATION = {
  en: {
    delete: 'Delete',
    reset: 'Reset'
  },
  ru: {
    delete: 'Удалить',
    reset: 'Сбросить'
  }
}

export const CharactersListItem = (props) => {
  const character = () => props.character;

  const [isOpen, setIsOpen] = createSignal(false);

  const [appState] = useAppState();
  const [{ renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const toggleMenu = (event) => {
    event.stopPropagation();

    setIsOpen(!isOpen());
  }

  const viewClick = (event) => {
    event.stopPropagation();

    props.onViewClick();
    setIsOpen(false);
  }

  const deleteClick = (event) => {
    setIsOpen(false);
    props.onDeleteCharacter(event);
  }

  const resetClick = (event) => {
    setIsOpen(false);
    props.onResetCharacter(event);
  }

  const copy = (event) => {
    event.stopPropagation();

    copyToClipboard(`https://${appState.rootHost}/characters/${character().id}.json`);
    renderNotice(t('alerts.copied'));
    setIsOpen(false);
  }

  const firstText = createMemo(() => {
    if (character().provider === 'dnd5') {
      return `${t('charactersPage.level')} ${character().level} | ${character().subrace ? localize(dnd5Config.races[character().race].subraces[character().subrace].name, locale()) : localize(dnd5Config.races[character().race].name, locale())}`;
    }
    if (character().provider === 'dnd2024') {
      return `${t('charactersPage.level')} ${character().level} | ${character().legacy ? localize(props.dnd2024Races[character().species].legacies[character().legacy].name, locale()) : localize(props.dnd2024Races[character().species].name, locale())}`;
    }
    if (character().provider === 'pathfinder2') {
      return `${t('charactersPage.level')} ${character().level} | ${character().subrace ? localize(pathfinder2Config.races[character().race].subraces[character().subrace].name, locale()) : localize(pathfinder2Config.races[character().race].name, locale())}`;
    }
    if (character().provider === 'daggerheart') {
      return `${t('charactersPage.level')} ${character().level} | ${character().names.ancestry_name}`;
    }
    if (character().provider === 'fallout') {
      return `${t('charactersPage.level')} ${character().level} | ${localize(falloutConfig.origins[character().origin].name, locale())}`;
    }
    if (character().provider === 'dc20') {
      return `${t('charactersPage.level')} ${character().level} | ${character().ancestries.map((item) => localize(dc20Config.ancestries[item].name, locale())).join(' * ')}`;
    }
  });

  const secondText = createMemo(() => {
    if (character().provider === 'dnd5') {
      return Object.keys(character().classes).map((item) => localize(dnd5Config.classes[item].name, locale())).join(' * ');
    }
    if (character().provider === 'dnd2024') {
      return Object.keys(character().classes).map((item) => localize(dnd2024Config.classes[item].name, locale())).join(' * ');
    }
    if (character().provider === 'pathfinder2') {
      return Object.keys(character().classes).map((item) => localize(pathfinder2Config.classes[item].name, locale())).join(' * ');
    }
    if (character().provider === 'daggerheart') {
      return Object.keys(character().names.subclass_names).join(' * ');
    }
    if (character().provider === 'dc20') {
      return localize(dc20Config.classes[character().main_class].name, locale());
    }
  });

  return (
    <div
      class="character-item"
      classList={{ 'character-item-not-active': !props.isActive, 'character-item-active': props.isActive }}
      onClick={props.onClick} // eslint-disable-line solid/reactivity
    >
      <div class="avatar-block">
        <Show when={character().avatar} fallback={<Avatar width={64} height={64} />}>
          <img src={character().avatar} class="avatar" />
        </Show>
      </div>
      <div
        class="character-item-box"
        classList={{ 'character-item-box-not-active': !props.isActive, 'character-item-box-active': props.isActive }}
      >
        <div class="flex-1 overflow-hidden">
          <p class="character-item-name truncate-text" classList={{ 'text-white!': props.isActive }}>{character().name}</p>
          <p class="character-item-first-text" classList={{ 'text-white!': props.isActive }}>{firstText()}</p>
          <p class="character-item-second-text" classList={{ 'text-white!': props.isActive }}>{secondText()}</p>
        </div>
        <div class="character-item-dots" use:clickOutside={() => setIsOpen(false)}>
          <IconButton onClick={toggleMenu}>
            <Dots />
          </IconButton>
          <Show when={isOpen()}>
            <div class="character-item-dots-dropdown">
              <p class="dots-item" onClick={deleteClick}>{localize(TRANSLATION, locale()).delete}</p>
              <Show when={AVAILABLE_RESET.includes(character().provider)}>
                <p class="dots-item" onClick={resetClick}>{localize(TRANSLATION, locale()).reset}</p>
              </Show>
              <Show when={AVAILABLE_JSON.includes(character().provider)}>
                <p class="dots-item" onClick={copy}>{t('charactersPage.onCopyCharacter')}</p>
              </Show>
              <Show when={!window.__TAURI_INTERNALS__ && AVAILABLE_PDF.includes(character().provider)}>
                <p class="dots-item" onClick={(e) => viewClick(e)}>PDF</p>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
