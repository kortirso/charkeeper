import { createSignal, Switch, Match, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, Dnd5Notes
} from '../../../components';
import { createModal, PageHeader } from '../../molecules';

import { Hamburger } from '../../../assets';
import { useAppState, useAppLocale } from '../../../context';

import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

export const Daggerheart = (props) => {
  const decoratedData = () => props.decoratedData;

  // page state
  const [activeTab, setActiveTab] = createSignal('traits');

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
          <Match when={props.provider === 'daggerheart'}>
            <p class="text-sm">
              {t(`daggerheart.heritages.${decoratedData().heritage}`)} | {Object.entries(decoratedData().classes).map(([item, value]) => `${t(`daggerheart.classes.${item}`)} ${value}`).join(' * ')}
            </p>
          </Match>
        </Switch>
      </PageHeader>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'traits'}>
            <DaggerheartTraits
              initialTraits={props.decoratedData.traits}
              onReloadCharacter={updateCharacter}
            />
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Dnd5Notes />
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('traits')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('notes')}>{t('character.notes')}</p>
      </Modal>
    </>
  );
}
