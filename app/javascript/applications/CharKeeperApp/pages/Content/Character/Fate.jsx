import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { FateAspects, FateSkills, FateVitals, FateConsequences, FateStunts } from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, createFateDiceRoll } from '../../../components';

export const Fate = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('aspects');
  const [activeTab, setActiveTab] = createSignal('skills');

  const { DiceRoll, openDiceRoll } = createFateDiceRoll();

  const characterTabs = createMemo(() => {
    return ['skills', 'vitals', 'notes', 'avatar'];
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
        <div class="p-2 pb-20 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'aspects'}>
              <FateAspects character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'skills'}>
              <FateSkills character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <FateStunts character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'vitals'}>
              <FateVitals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <FateConsequences character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <FateAspects character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <div class="p-2 pb-20 flex-1">
          <Switch>
            <Match when={activeTab() === 'skills'}>
              <FateSkills character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <FateStunts character={character()} openDiceRoll={openDiceRoll} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeTab() === 'vitals'}>
              <FateVitals character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <FateConsequences character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
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
      <DiceRoll characterId={character().id} />
    </>
  );
}
