import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, Dnd5Notes
} from '../../../components';

import { useAppState, useAppLocale } from '../../../context';

import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

export const Daggerheart = (props) => {
  // page state
  const [activeTab, setActiveTab] = createSignal('traits');

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.provider, props.characterId, { character: payload });

    if (result.errors === undefined) await props.onReloadCharacter();
    return result;
  }

  return (
    <>
      <div id="character-navigation">
        <p
          classList={{ 'active': activeTab() === 'traits' }}
          onClick={() => setActiveTab('traits')}
        >
          {t('character.abilities')}
        </p>
        <p
          classList={{ 'active': activeTab() === 'notes' }}
          onClick={() => setActiveTab('notes')}
        >
          {t('character.notes')}
        </p>
      </div>
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
    </>
  );
}
