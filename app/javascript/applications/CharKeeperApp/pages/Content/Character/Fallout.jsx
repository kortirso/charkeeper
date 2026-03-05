import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { FalloutAbilities, FalloutSkills, FalloutLeveling } from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    levelingHelpMessage: 'In the future on this tab you can level up your character.'
  },
  ru: {
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.'
  }
}

export const Fallout = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('classLevels');

  const [locale] = useAppLocale();

  const characterTabs = createMemo(() => {
    return ['classLevels', 'notes', 'avatar'];
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
          markedTabs={{ '3': 'classLevels' }}
        />
        <div class="p-2 pb-20 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <FalloutAbilities
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
              <div class="mt-4">
                <FalloutSkills
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <FalloutLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                helpMessage={localize(TRANSLATION, locale()).levelingHelpMessage}
              />
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
        <FalloutAbilities
          character={character()}
          onReplaceCharacter={props.onReplaceCharacter}
          onReloadCharacter={props.onReloadCharacter}
        />
        <div class="mt-4">
          <FalloutSkills
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('classLevels')}
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
        />
        <div class="p-2 pb-20 flex-1">
          <Switch>
            <Match when={activeTab() === 'classLevels'}>
              <FalloutLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                currentGuideStep={character().guide_step}
                helpMessage={localize(TRANSLATION, locale()).levelingHelpMessage}
              />
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
