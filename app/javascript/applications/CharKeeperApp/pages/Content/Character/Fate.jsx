import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { FateAspects, FateSkills } from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper } from '../../../components';

export const Fate = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('aspects');
  const [activeTab, setActiveTab] = createSignal('skills');

  const characterTabs = createMemo(() => {
    return ['skills', 'notes', 'avatar'];
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['aspects'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'aspects'}>
              <FateAspects character={character()} />
            </Match>
            <Match when={activeMobileTab() === 'skills'}>
              <FateSkills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <FateAspects character={character()} />
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={characterTabs()}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'skills'}>
              <FateSkills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
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
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
    </>
  );
}
