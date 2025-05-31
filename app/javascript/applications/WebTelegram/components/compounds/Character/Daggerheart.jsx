import { createSignal, Switch, Match } from 'solid-js';

import {
  DaggerheartTraits, DaggerheartCombat, DaggerheartEquipment, Notes, Avatar, CharacterNavigation
} from '../../../components';

export const Daggerheart = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('traits');

  return (
    <>
      <CharacterNavigation
        tabsList={['traits', 'combat', 'equipment', 'notes', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'traits'}>
            <DaggerheartTraits
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <DaggerheartCombat
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <DaggerheartEquipment
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
