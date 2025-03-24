import { createSignal, Switch, Match, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Dnd5Notes
} from '../../../components';
import { createModal, PageHeader } from '../../molecules';

import { Hamburger } from '../../../assets';
import { useAppState, useAppLocale } from '../../../context';

import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

export const Pathfinder2 = (props) => {
  const decoratedData = () => props.decoratedData;

  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.provider, props.characterId, { character: payload });

    if (result.errors === undefined) await props.onReloadCharacter();
    return result;
  }

  // user actions
  const changeTab = (value) => {
    batch(() => {
      setActiveTab(value);
      closeModal();
    });
  }

  return (
    <>
      <PageHeader rightContent={<Hamburger onClick={openModal} />}>
        <p>{props.name}</p>
        <Switch>
          <Match when={props.provider === 'pathfinder2'}>
            <p class="text-sm">
              {decoratedData().subrace ? t(`pathfinder2.subraces.${decoratedData().race}.${decoratedData().subrace}`) : t(`pathfinder2.races.${decoratedData().race}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`pathfinder2.classes.${item}`)} ${value}`).join(' * ')}
            </p>
          </Match>
        </Switch>
      </PageHeader>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'abilities'}>
            <Pathfinder2Abilities
              initialAbilities={props.decoratedData.abilities}
              modifiers={props.decoratedData.modifiers}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Dnd5Notes />
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('notes')}>{t('character.notes')}</p>
      </Modal>
    </>
  );
}
