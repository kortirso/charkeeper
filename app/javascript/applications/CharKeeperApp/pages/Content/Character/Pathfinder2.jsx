import { createSignal, createMemo, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  Pathfinder2Abilities, Pathfinder2Health, Pathfinder2Professions, Pathfinder2Static, Pathfinder2Skills,
  Pathfinder2SavingThrows
} from '../../../pages';
import {
  CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper, Conditions, Gold, createDiceRoll, Combat
} from '../../../components';
import { useAppLocale } from '../../../context';

export const Pathfinder2 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { DiceRoll, openDiceRoll, openSimpleDiceRoll } = createDiceRoll();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const weaponFilter = (item) => item.kind === 'weapon';
  const armorFilter = (item) => item.kind === 'armor';

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities', 'combat', 'equipment', 'notes', 'professions', 'avatar']}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Pathfinder2Abilities
                character={character()}
                openDiceRoll={openDiceRoll}
                onReplaceCharacter={props.onReplaceCharacter}
              />
              <div class="mt-4">
                <Pathfinder2SavingThrows
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
              <div class="mt-4">
                <Pathfinder2Skills
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Pathfinder2Static character={character()} openDiceRoll={openDiceRoll} />
              <div class="mt-4">
                <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  openSimpleDiceRoll={openSimpleDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'professions'}>
              <Pathfinder2Professions character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <Pathfinder2Abilities
          character={character()}
          openDiceRoll={openDiceRoll}
          onReplaceCharacter={props.onReplaceCharacter}
        />
        <div class="flex flex-col emd:flex-row emd:gap-4 emd:mt-4">
          <div class="mt-4 emd:mt-0 flex-1">
            <Pathfinder2SavingThrows
              character={character()}
              openDiceRoll={openDiceRoll}
              onReplaceCharacter={props.onReplaceCharacter}
            />
            <div class="mt-4">
              <Conditions character={character()} />
            </div>
          </div>
          <div class="mt-4 emd:mt-0 flex-1">
            <Pathfinder2Skills
              character={character()}
              openDiceRoll={openDiceRoll}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </div>
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['combat', 'equipment', 'notes', 'professions', 'avatar']}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Pathfinder2Static character={character()} openDiceRoll={openDiceRoll} />
              <div class="mt-4">
                <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  openSimpleDiceRoll={openSimpleDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
  });

  return (
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
      <DiceRoll provider="dnd" characterId={character().id} />
    </>
  );
}
