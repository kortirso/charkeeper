import { createSignal, Switch, Match, batch, createEffect, createMemo } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  Dnd5Abilities, Dnd5Combat, Dnd5Rest, Dnd5ClassLevels, Dnd5Professions, Dnd5Spellbook, Dnd5Spells, DndGold,
  Dnd5Skills, Dnd5SavingThrows
} from '../../../pages';
import { CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper } from '../../../components';
import { useAppState, useAppLocale } from '../../../context';

import { fetchCharacterSpellsRequest } from '../../../requests/fetchCharacterSpellsRequest';
import { updateCharacterRequest } from '../../../requests/updateCharacterRequest';
import { fetchSpellsRequest } from '../../../requests/fetchSpellsRequest';
import { createCharacterSpellRequest } from '../../../requests/createCharacterSpellRequest';
import { removeCharacterSpellRequest } from '../../../requests/removeCharacterSpellRequest';
import { updateCharacterSpellRequest } from '../../../requests/updateCharacterSpellRequest';

export const Dnd5 = (props) => {
  const character = () => props.character;
  const spellClassesList = () => Object.keys(character().spell_classes);

  // page state
  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');
  const [activeSpellsTab, setActiveSpellsTab] = createSignal(false);

  // page data
  const [spells, setSpells] = createSignal(undefined);
  const [characterSpells, setCharacterSpells] = createSignal(undefined);

  // shared state
  const [spentSpellSlots, setSpentSpellSlots] = createSignal(character().spent_spell_slots);

  const [appState] = useAppState();
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  // initial data fetching
  createEffect(() => {
    if (activeTab() !== 'spells' && activeMobileTab() !== 'spells') return;
    if (spellClassesList().length === 0) return;
    if (characterSpells() !== undefined) return;

    const spellLevels = Object.keys(character().spells_slots);

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, props.character.provider, appState.activePageParams.id);
    const fetchSpells = async () => await fetchSpellsRequest(
      appState.accessToken,
      props.character.provider,
      { max_level: spellLevels.length === 0 ? 0 : Math.max(...spellLevels) }
    );

    Promise.all([fetchCharacterSpells(), fetchSpells()]).then(
      ([characterSpellsData, spellsData]) => {
        batch(() => {
          setCharacterSpells(characterSpellsData.spells);
          setSpells(spellsData.spells);
        });
      }
    );
  });

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

  // additional data change for spells
  const reloadCharacterSpells = async () => {
    const characterSpellsData = await fetchCharacterSpellsRequest(appState.accessToken, props.character.provider, appState.activePageParams.id);
    setCharacterSpells(characterSpellsData.spells);
  }

  const learnSpell = async (spellId, targetSpellClass) => {
    const result = await createCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, { spell_id: spellId, target_spell_class: targetSpellClass });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const forgetSpell = async (spellId) => {
    const result = await removeCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId);
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const prepareSpell = async (spellId) => {
    const result = await updateCharacterSpell(spellId, { 'ready_to_use': 1 });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const disableSpell = async (spellId) => {
    const result = await updateCharacterSpell(spellId, { 'ready_to_use': 0 });
    if (result.errors === undefined) reloadCharacterSpells();
  }

  const updateSpellNotes = async (spellId, notes) => {
    const result = await updateCharacterSpell(spellId, { 'notes': notes });
    if (result.errors === undefined) reloadCharacterSpells();
    return result;
  }

  const updateCharacterSpell = async (spellId, payload) => {
    return await updateCharacterSpellRequest(appState.accessToken, props.character.provider, props.character.id, spellId, payload);
  }

  // shared data
  const spendSpellSlot = async (level) => {
    let newValue;
    if (spentSpellSlots()[level]) {
      newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] + 1 };
    } else {
      newValue = { ...spentSpellSlots(), [level]: 1 };
    }

    const result = await refreshCharacter({ spent_spell_slots: newValue });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }

  const freeSpellSlot = async (level) => {
    const newValue = { ...spentSpellSlots(), [level]: spentSpellSlots()[level] - 1 };

    const result = await refreshCharacter({ spent_spell_slots: newValue });
    if (result.errors === undefined) setSpentSpellSlots(newValue);
  }


  // memos
  const knownSpellIds = createMemo(() => {
    if (characterSpells() === undefined) return [];

    return characterSpells().map(({ spell_id }) => spell_id);
  });

  const itemFilter = (item) => item.kind === 'item';
  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor') || item.kind.includes('shield');
  const ammoFilter = (item) => item.kind === 'ammo';
  const focusFilter = (item) => item.kind === 'focus';
  const toolsFilter = (item) => item.kind === 'tools';
  const musicFilter = (item) => item.kind === 'music';

  return (
    <ContentWrapper
      mobileView={
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
                  <Dnd5SavingThrows character={character()} />
                </div>
                <div class="mt-4">
                  <Dnd5Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
                <Switch>
                  <Match when={spellClassesList().length === 0}>
                    <div class="p-4 flex blockable dark:text-snow">
                      <p>{t('character.no_magic')}</p>
                    </div>
                  </Match>
                  <Match when={spells() === undefined || characterSpells() === undefined}>
                    <></>
                  </Match>
                  <Match when={activeSpellsTab()}>
                    <Dnd5Spells
                      character={character()}
                      spells={spells()}
                      characterSpells={characterSpells()}
                      initialSpellClassesList={spellClassesList()}
                      knownSpellIds={knownSpellIds()}
                      onLearnSpell={learnSpell}
                      onForgetSpell={forgetSpell}
                      onNavigatoToSpellbook={() => setActiveSpellsTab(false)}
                    />
                  </Match>
                  <Match when={!activeSpellsTab()}>
                    <Dnd5Spellbook
                      character={character()}
                      spells={spells()}
                      characterSpells={characterSpells()}
                      initialSpellClassesList={spellClassesList()}
                      spentSpellSlots={spentSpellSlots()}
                      onSpendSpellSlot={spendSpellSlot}
                      onFreeSpellSlot={freeSpellSlot}
                      onNavigatoToSpells={() => setActiveSpellsTab(true)}
                      onUpdateSpellNotes={updateSpellNotes}
                      onPrepareSpell={prepareSpell}
                      onDisableSpell={disableSpell}
                    />
                  </Match>
                </Switch>
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
      }
      leftView={
        <>
          <Dnd5Abilities character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          <div class="flex flex-col emd:flex-row emd:gap-4 emd:mt-4">
            <div class="mt-4 emd:mt-0 flex-1">
              <Dnd5SavingThrows character={character()} />
            </div>
            <div class="mt-4 emd:mt-0 flex-1">
              <Dnd5Skills character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </div>
          </div>
        </>
      }
      rightView={
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
                <Switch>
                  <Match when={spellClassesList().length === 0}>
                    <div class="p-4 flex blockable">
                      <p>{t('character.no_magic')}</p>
                    </div>
                  </Match>
                  <Match when={spells() === undefined || characterSpells() === undefined}>
                    <></>
                  </Match>
                  <Match when={activeSpellsTab()}>
                    <Dnd5Spells
                      character={character()}
                      spells={spells()}
                      characterSpells={characterSpells()}
                      initialSpellClassesList={spellClassesList()}
                      knownSpellIds={knownSpellIds()}
                      onLearnSpell={learnSpell}
                      onForgetSpell={forgetSpell}
                      onNavigatoToSpellbook={() => setActiveSpellsTab(false)}
                    />
                  </Match>
                  <Match when={!activeSpellsTab()}>
                    <Dnd5Spellbook
                      character={character()}
                      spells={spells()}
                      characterSpells={characterSpells()}
                      initialSpellClassesList={spellClassesList()}
                      spentSpellSlots={spentSpellSlots()}
                      onSpendSpellSlot={spendSpellSlot}
                      onFreeSpellSlot={freeSpellSlot}
                      onNavigatoToSpells={() => setActiveSpellsTab(true)}
                      onUpdateSpellNotes={updateSpellNotes}
                      onPrepareSpell={prepareSpell}
                      onDisableSpell={disableSpell}
                    />
                  </Match>
                </Switch>
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
      }
    />
  );
}
