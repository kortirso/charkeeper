import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Dnd5Notes
} from '../../../components';

import { useAppState, useAppLocale } from '../../../context';

import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

export const Pathfinder2 = (props) => {
  // page state
  const [activeTab, setActiveTab] = createSignal('abilities');

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
          classList={{ 'active': activeTab() === 'abilities' }}
          onClick={() => setActiveTab('abilities')}
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
    </>
  );
}
