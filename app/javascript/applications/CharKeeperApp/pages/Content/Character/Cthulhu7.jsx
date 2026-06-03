import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { Cthulhu7Abilities, Cthulhu7Skills } from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, createRoll } from '../../../components';

export const Cthulhu7 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('notes');

  const { Roll, openCthulhuTest } = createRoll();

  const characterTabs = createMemo(() => {
    return ['notes', 'avatar'];
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{}}
        />
        <div class="p-2 pb-20 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Cthulhu7Abilities
                character={character()}
                openCthulhuTest={openCthulhuTest}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
              <div class="mt-4">
                <Cthulhu7Skills
                  character={character()}
                  openCthulhuTest={openCthulhuTest}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
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
        <Cthulhu7Abilities
          character={character()}
          openCthulhuTest={openCthulhuTest}
          onReplaceCharacter={props.onReplaceCharacter}
          onReloadCharacter={props.onReloadCharacter}
        />
        <div class="mt-4">
          <Cthulhu7Skills
            character={character()}
            openCthulhuTest={openCthulhuTest}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
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
          currentGuideStep={character().guide_step}
          markedTabs={{}}
        />
        <div class="p-2 pb-20 flex-1">
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
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
      <Roll provider="cthulhu7" characterId={character().id} />
    </>
  );
}
