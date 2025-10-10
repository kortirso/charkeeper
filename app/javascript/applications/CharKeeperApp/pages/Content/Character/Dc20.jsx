import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  Dc20Abilities, Dc20Skills
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper } from '../../../components';

export const Dc20 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities', 'notes', 'avatar']}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Dc20Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Dc20Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    )
  });

  const leftView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <Dc20Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        <div class="flex flex-col emd:flex-row emd:gap-4 emd:mt-4">
          <div class="mt-4 emd:mt-0 flex-1">
            <Dc20Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
          <div class="mt-4 emd:mt-0 flex-1" />
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['notes', 'avatar']}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 flex-1">
          <Switch>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    );
  });

  return (
    <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
  );
}
