import { createSignal, createMemo, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5Rest, Dnd5ClassLevels, Dnd5Professions, Dnd5Spells, DndGold, Dnd5Skills, Dnd5SavingThrows,
  Dnd5Proficiency
} from '../../../pages';
import { CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper, Feats } from '../../../components';
import { useAppState, useAppLocale } from '../../../context';
import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';

export const Dnd5 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  // page state
  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // only sends request
  const refreshCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    return result;
  }

  // sends request and reload character data
  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, props.character.provider, props.character.id, { character: payload });

    if (result.errors === undefined) await props.onReloadCharacter();
    return result;
  }

  const itemFilter = (item) => item.kind === 'item';
  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor') || item.kind.includes('shield');
  const ammoFilter = (item) => item.kind === 'ammo';
  const focusFilter = (item) => item.kind === 'focus';
  const toolsFilter = (item) => item.kind === 'tools';
  const musicFilter = (item) => item.kind === 'music';

  const raceFilter = (item) => item.origin === 'race';
  const subraceFilter = (item) => item.origin === 'subrace';
  const speciesFilter = (item) => item.origin === 'species';
  const legacyFilter = (item) => item.origin === 'legacy';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';
  const featFilter = (item) => item.origin === 'feat';

  const featDnd5Filters = createMemo(() => {
    const result = [{ title: 'race', callback: raceFilter }];

    if (character().subrace) result.push({ title: 'subrace', callback: subraceFilter });
    result.push({ title: 'class', callback: classFilter });
    if (character().subclasses.length > 0) result.push({ title: 'subclass', callback: subclassFilter });

    return result;
  });

  const featDnd2024Filters = createMemo(() => {
    const result = [{ title: 'species', callback: speciesFilter }];

    if (character().legacy) result.push({ title: 'legacy', callback: legacyFilter });
    result.push({ title: 'class', callback: classFilter });
    if (character().subclasses.length > 0) result.push({ title: 'subclass', callback: subclassFilter });
    result.push({ title: 'feat', callback: featFilter });

    return result;
  });

  const featFilters = createMemo(() => character().provider === 'dnd5' ? featDnd5Filters() : featDnd2024Filters());

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities', 'combat', 'equipment', 'spells', 'rest', 'notes', 'professions', 'classLevels', 'avatar']}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 flex-1 overflow-y-scroll">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Dnd5Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Dnd5Proficiency character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Dnd5SavingThrows character={character()} />
              </div>
              <div class="mt-4">
                <Dnd5Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Dnd5Combat
                character={character()}
                onReloadCharacter={updateCharacter}
                onRefreshCharacter={refreshCharacter}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <Dnd5Rest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.itemsList'), callback: itemFilter },
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.ammoList'), callback: ammoFilter },
                  { title: t('equipment.focusList'), callback: focusFilter },
                  { title: t('equipment.toolsList'), callback: toolsFilter },
                  { title: t('equipment.musicList'), callback: musicFilter},
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <DndGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'spells'}>
              <Dnd5Spells character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <Dnd5ClassLevels character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'professions'}>
              <Dnd5Professions
                character={character()}
                onRefreshCharacter={refreshCharacter}
                onReloadCharacter={updateCharacter}
              />
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
        <Dnd5Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        <div class="flex flex-col emd:flex-row emd:gap-4 emd:mt-4">
          <div class="mt-4 emd:mt-0 flex-1">
            <Dnd5Proficiency character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            <div class="mt-4">
              <Dnd5SavingThrows character={character()} />
            </div>
          </div>
          <div class="mt-4 emd:mt-0 flex-1">
            <Dnd5Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
          tabsList={['combat', 'equipment', 'spells', 'rest', 'notes', 'professions', 'classLevels', 'avatar']}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
        />
        <div class="p-2 flex-1 overflow-y-scroll emd:overflow-y-hidden">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Dnd5Combat
                character={character()}
                onReloadCharacter={updateCharacter}
                onRefreshCharacter={refreshCharacter}
                onReplaceCharacter={props.onReplaceCharacter}
              />
              <div class="mt-4">
                <Feats character={character()} filters={featFilters()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
            </Match>
            <Match when={activeTab() === 'rest'}>
              <Dnd5Rest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: t('equipment.itemsList'), callback: itemFilter },
                  { title: t('equipment.weaponsList'), callback: weaponFilter },
                  { title: t('equipment.armorList'), callback: armorFilter },
                  { title: t('equipment.ammoList'), callback: ammoFilter },
                  { title: t('equipment.focusList'), callback: focusFilter },
                  { title: t('equipment.toolsList'), callback: toolsFilter },
                  { title: t('equipment.musicList'), callback: musicFilter},
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <DndGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeTab() === 'spells'}>
              <Dnd5Spells character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <Dnd5ClassLevels character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'professions'}>
              <Dnd5Professions
                character={character()}
                onRefreshCharacter={refreshCharacter}
                onReloadCharacter={updateCharacter}
              />
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
