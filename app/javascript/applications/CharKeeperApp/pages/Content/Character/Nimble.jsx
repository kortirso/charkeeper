import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  NimbleAbilities, NimbleSkills, NimbleBonuses, NimbleInfo
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Equipment } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    equipmentHelpMessage: 'Here you can select equipment for your character.',
    levelingHelpMessage: 'In the future on this tab you can level up your character.'
  },
  ru: {
    equipmentHelpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.',
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.'
  },
  es: {
    equipmentHelpMessage: 'Aquí puedes seleccionar el equipo para tu personaje.',
    levelingHelpMessage: 'En el futuro en esta pestaña podrás subir de nivel a tu personaje.'
  }
}

export const Nimble = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('equipment');

  const [locale] = useAppLocale();

  const characterTabs = createMemo(() => {
    const result = ['equipment'];
    return result.concat(['bonuses', 'notes', 'avatar']);
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
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <NimbleInfo character={character()} />
              <div class="mt-4">
                <NimbleAbilities
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <NimbleSkills
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                finishGuideStep={true}
                helpMessage={localize(TRANSLATION, locale())['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
        <NimbleInfo character={character()} />
        <div class="mt-4">
          <NimbleAbilities
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <NimbleSkills
            character={character()}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('equipment')}
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
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                finishGuideStep={true}
                helpMessage={localize(TRANSLATION, locale())['equipmentHelpMessage']}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
              />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
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
