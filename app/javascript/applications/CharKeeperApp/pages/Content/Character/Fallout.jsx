import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import { FalloutAbilities, FalloutSkills, FalloutLeveling } from '../../../pages';
import {
  CharacterNavigation, Notes, Avatar, ContentWrapper, createFalloutDiceRoll, Equipment, Combat
} from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    equipmentHelpMessage: 'Here you can select equipment for your character.',
    levelingHelpMessage: 'In the future on this tab you can level up your character.',
    weaponFilters: {
      meleeWeapons: 'Melee Weapons',
      smallGuns: 'Small Guns'
    }
  },
  ru: {
    equipmentHelpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.',
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.',
    weaponFilters: {
      meleeWeapons: 'Рукопашное оружие',
      smallGuns: 'Стрелковое оружие'
    }
  }
}

export const Fallout = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { DiceRoll, openDiceRoll, openAttackRoll } = createFalloutDiceRoll();

  const [locale] = useAppLocale();

  const meleeWeaponsFilter = (item) => item.kind.includes('melee_weapons');
  const smallGungsFilter = (item) => item.kind.includes('small_guns');

  const characterTabs = createMemo(() => {
    return ['combat', 'equipment', 'classLevels', 'notes', 'avatar'];
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
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
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
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Combat
                character={character()}
                openDiceRoll={openDiceRoll}
                openAttackRoll={openAttackRoll}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).weaponFilters.meleeWeapons, callback: meleeWeaponsFilter },
                  { title: localize(TRANSLATION, locale()).weaponFilters.smallGuns, callback: smallGungsFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={localize(TRANSLATION, locale()).equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
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
            openDiceRoll={openDiceRoll}
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
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-20 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Combat
                character={character()}
                openDiceRoll={openDiceRoll}
                openAttackRoll={openAttackRoll}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).weaponFilters.meleeWeapons, callback: meleeWeaponsFilter },
                  { title: localize(TRANSLATION, locale()).weaponFilters.smallGuns, callback: smallGungsFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={localize(TRANSLATION, locale()).equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveTab('classLevels')}
              />
            </Match>
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
      <DiceRoll characterId={character().id} />
    </>
  );
}
