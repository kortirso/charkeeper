import { createSignal, createMemo, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  Dc20Abilities, Dc20Skills, Dc20Saves, Dc20CombatStatic
} from '../../../pages';
import {
  CharacterNavigation, Notes, Avatar, ContentWrapper, createDiceRoll, Conditions, Equipment, Combat
} from '../../../components';
import { useAppLocale } from '../../../context';

export const Dc20 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const { DiceRoll, openDiceRoll } = createDiceRoll();

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor');
  const shieldFilter = (item) => item.kind.includes('shield');

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities', 'combat', 'equipment', 'notes', 'avatar']}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Dc20Abilities
                character={character()}
                openDiceRoll={openDiceRoll}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
              <div class="mt-4">
                <Dc20Saves character={character()} openDiceRoll={openDiceRoll} />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
              <div class="mt-4">
                <Dc20Skills
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Dc20CombatStatic character={character()} openDiceRoll={openDiceRoll} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.shieldList'), callback: shieldFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
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
        <Dc20Abilities
          character={character()}
          openDiceRoll={openDiceRoll}
          onReplaceCharacter={props.onReplaceCharacter}
          onReloadCharacter={props.onReloadCharacter}
        />
        <div class="mt-4">
          <Dc20Saves character={character()} openDiceRoll={openDiceRoll} />
        </div>
        <div class="mt-4">
          <Conditions character={character()} />
        </div>
        <div class="mt-4">
          <Dc20Skills
            character={character()}
            openDiceRoll={openDiceRoll}
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
          tabsList={['combat', 'equipment', 'notes', 'avatar']}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Dc20CombatStatic character={character()} openDiceRoll={openDiceRoll} />
              <div class="mt-4">
                <Combat
                  character={character()}
                  openDiceRoll={openDiceRoll}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                character={character()}
                itemFilters={[
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.shieldList'), callback: shieldFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
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
      <DiceRoll provider="dc20" characterId={character().id} />
    </>
  );
}
