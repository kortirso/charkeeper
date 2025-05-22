import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Dnd5Notes
} from '../../../components';

import { useAppLocale } from '../../../context';

export const Pathfinder2 = (props) => {
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
              id={props.character.id}
              initialAbilities={props.character.abilities}
              initialSkills={props.character.skills}
              modifiers={props.character.modifiers}
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
