import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Pathfinder2Combat, Pathfinder2Professions,
  Notes, Avatar, CharacterNavigation, Equipment, DndGold
} from '../../../components';
import { useAppLocale } from '../../../context';

export const Pathfinder2 = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('abilities');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const armorFilter = (item) => item.kind === 'armor';

  return (
    <>
      <CharacterNavigation
        tabsList={['abilities', 'combat', 'equipment', 'notes', 'professions', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
      <div class="p-2 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'abilities'}>
            <Pathfinder2Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <Pathfinder2Combat character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <Equipment
              withWeight
              withPrice
              character={character()}
              itemFilters={[{ title: t('character.armorList'), callback: armorFilter }]}
              onReplaceCharacter={props.onReplaceCharacter}
              onReloadCharacter={props.onReloadCharacter}
            >
              <DndGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Equipment>
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Notes />
          </Match>
          <Match when={activeTab() === 'professions'}>
            <Pathfinder2Professions character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </Match>
          <Match when={activeTab() === 'avatar'}>
            <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </Match>
        </Switch>
      </div>
    </>
  );
}
