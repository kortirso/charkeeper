import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Pathfinder2Combat, Dnd5Notes
} from '../../../components';

import { useAppLocale } from '../../../context';

export const Pathfinder2 = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('abilities');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

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
          classList={{ 'active': activeTab() === 'combat' }}
          onClick={() => setActiveTab('combat')}
        >
          {t('character.combat')}
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
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <Pathfinder2Combat
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
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
