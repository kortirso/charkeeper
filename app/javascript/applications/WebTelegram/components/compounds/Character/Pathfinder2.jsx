import { createSignal, Switch, Match } from 'solid-js';

import {
  Pathfinder2Abilities, Pathfinder2Combat, Notes, Avatar, CharacterNavigation
} from '../../../components';

export const Pathfinder2 = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('abilities');

  return (
    <>
      <CharacterNavigation
        tabsList={['abilities', 'combat', 'notes', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
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
            <Notes />
          </Match>
          <Match when={activeTab() === 'avatar'}>
            <Avatar
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
        </Switch>
      </div>
    </>
  );
}
