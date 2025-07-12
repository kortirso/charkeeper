import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Pathfinder2Abilities, Pathfinder2Health, Pathfinder2Professions, DndGold, Pathfinder2Static, Pathfinder2Skills,
  Pathfinder2SavingThrows
} from '../../../pages';
import { CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper } from '../../../components';
import { useAppLocale } from '../../../context';

export const Pathfinder2 = (props) => {
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const weaponFilter = (item) => item.kind === 'weapon';
  const armorFilter = (item) => item.kind === 'armor';

  return (
    <ContentWrapper
      mobileView={
        <>
          <CharacterNavigation
            tabsList={['abilities', 'combat', 'equipment', 'notes', 'professions', 'avatar']}
            activeTab={activeMobileTab()}
            setActiveTab={setActiveMobileTab}
          />
          <div class="p-2 flex-1 overflow-y-scroll">
            <Switch>
              <Match when={activeMobileTab() === 'abilities'}>
                <Pathfinder2Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                <div class="mt-2">
                  <Pathfinder2SavingThrows character={character()} />
                </div>
                <div class="mt-4">
                  <Pathfinder2Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Match>
              <Match when={activeMobileTab() === 'combat'}>
                <Pathfinder2Static character={character()} />
                <div class="mt-4">
                  <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
                  <DndGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
      }
      leftView={
        <>
          <Pathfinder2Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          <div class="mt-4">
            <Pathfinder2SavingThrows character={character()} />
          </div>
          <div class="mt-4">
            <Pathfinder2Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </>
      }
      rightView={
        <>
          <CharacterNavigation
            tabsList={['combat', 'equipment', 'notes', 'professions', 'avatar']}
            activeTab={activeTab()}
            setActiveTab={setActiveTab}
          />
          <div class="p-2 flex-1 overflow-y-scroll">
            <Switch>
              <Match when={activeTab() === 'combat'}>
                <Pathfinder2Static character={character()} />
                <div class="mt-4">
                  <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
      }
    />
  );
}
