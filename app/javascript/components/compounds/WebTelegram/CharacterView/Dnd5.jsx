import { Switch, Match, batch, For, Show, createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { createModal } from '../../../molecules';
import { Checkbox, Select, CollapseBox } from '../../../atoms';

import { useAppState, useAppLocale } from '../../../../context';
import { capitalize, modifier } from '../../../../helpers';

import { fetchCharacterItemsRequest } from '../../../../requests/fetchCharacterItemsRequest';
import { fetchCharacterSpellsRequest } from '../../../../requests/fetchCharacterSpellsRequest';

export const Dnd5 = (props) => {
  const [pageState, setPageState] = createStore({
    activeTab: 'abilities',
    characterItems: undefined,
    characterSpells: undefined,
    activeSpellClass: 'all',
    preparedSpellFilter: false
  });

  const { Modal, openModal, closeModal } = createModal();
  const [appState] = useAppState();
  const [_locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const modifiers = () => props.character.decorated_data.modifiers;
  const saveDC = () => props.character.decorated_data.save_dc;
  const combat = () => props.character.decorated_data.combat;
  const attacks = () => props.character.decorated_data.attacks;
  const skills = () => props.character.decorated_data.skills;

  const filteredSpells = createMemo(() => {
    if (pageState.characterSpells === undefined) return [];

    return pageState.characterSpells.filter((item) => {
      if (pageState.activeSpellClass !== 'all' && item.data.class !== pageState.activeSpellClass) return false;
      if (pageState.preparedSpellFilter ) return item.ready_to_use;
      return true;
    });
  });

  const manyActiveSpellClasses = createMemo(() => props.character.decorated_data.spell_classes.length > 1);

  createEffect(() => {
    if (pageState.activeTab !== 'equipment') return;
    if (pageState.characterItems !== undefined) return;

    const fetchCharacterItems = async () => await fetchCharacterItemsRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacterItems()]).then(
      ([characterItemsData]) => {
        setPageState({
          ...pageState,
          characterItems: characterItemsData.items
        });
      }
    );
  });

  createEffect(() => {
    if (pageState.activeTab !== 'spells') return;
    if (pageState.characterSpells !== undefined) return;

    const fetchCharacterSpells = async () => await fetchCharacterSpellsRequest(appState.accessToken, appState.activePageParams.id);

    Promise.all([fetchCharacterSpells()]).then(
      ([characterSpellsData]) => {
        setPageState({
          ...pageState,
          characterSpells: characterSpellsData.spells
        });
      }
    );
  });

  const changeTab = (value) => {
    batch(() => {
      setPageState({ ...pageState, activeTab: value });
      closeModal();
    });
  }

  const renderAbility = (ability) => (
    <div class="flex items-start mb-2">
      <div class="white-box flex flex-col items-center w-2/5 p-2">
        <p class="text-sm mb-1">{t(`abilities.${ability}`)} {props.character.decorated_data.abilities[ability]}</p>
        <p class="text-2xl mb-1">{modifier(modifiers()[ability])}</p>
      </div>
      <div class="w-3/5 pl-4">
        <div class="white-box p-2">
          <div class="flex justify-between">
            <p>{t('terms.saveDC')}</p>
            <p>{modifier(saveDC()[ability])}</p>
          </div>
          <div class="mt-2">
            <For each={skills().filter((item) => item.ability === ability)}>
              {(skill) =>
                <div class="flex justify-between">
                  <p>{t(`skills.${skill.name}`)}</p>
                  <p>{modifier(skill.modifier)}</p>
                </div>
              }
            </For>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttacksBox = (title, values) => {
    if (values.length === 0) return <></>;

    return (
      <div class="p-4 white-box mb-2">
        <h2 class="text-lg mb-2">{title}</h2>
        <table class="w-full table">
          <thead>
            <tr>
              <td></td>
              <td class="text-center">{t('attacks.bonus')}</td>
              <td class="text-center">{t('attacks.damage')}</td>
              <td class="text-center">{t('attacks.distance')}</td>
            </tr>
          </thead>
          <tbody>
            <For each={values}>
              {(attack) => renderAttack(attack)}
            </For>
          </tbody>
        </table>
      </div>
    );
  }

  const renderAttack = (attack) => (
    <tr>
      <td class="py-1">
        <p>{attack.name}</p>
        <Show when={attack.hands == 2}><p class="text-xs">{t('damage.2hands')}</p></Show>
      </td>
      <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
      <td class="py-1 text-center">
        <p>{attack.damage}{modifier(attack.damage_bonus)}</p>
        <p class="text-xs">{t(`damage.${attack.damage_type}`)}</p>
      </td>
      <td class="py-1 text-center">
        <Show when={attack.melee_distance}><p>{attack.melee_distance}</p></Show>
        <Show when={attack.range_distance}><p>{attack.range_distance}</p></Show>
      </td>
    </tr>
  );

  const renderCombatStat = (title, value) => (
    <div class="w-1/3 flex flex-col items-center">
      <p class="uppercase text-sm mb-1">{title}</p>
      <p class="text-2xl mb-1">{value}</p>
    </div>
  );

  const renderItemsBox = (title, items) => (
    <div class="p-4 white-box mb-2">
      <h2 class="text-lg">{title}</h2>
      <table class="w-full table">
        <thead>
          <tr>
            <td></td>
            <td class="text-center">{t('equipment.quantity')}</td>
            <td class="text-center">{t('equipment.weight')}</td>
            <td class="text-center">{t('equipment.cost')}</td>
          </tr>
        </thead>
        <tbody>
          <For each={items}>
            {(characterItem) => renderItem(characterItem)}
          </For>
        </tbody>
      </table>
    </div>
  );

  const renderItem = (characterItem) => (
    <tr>
      <td class="py-1">
        <p>{characterItem.name}</p>
      </td>
      <td class="py-1 text-center">{characterItem.quantity}</td>
      <td class="py-1 text-center">{characterItem.weight * characterItem.quantity}</td>
      <td class="py-1 text-center">{characterItem.quantity * characterItem.price / 100}</td>
    </tr>
  );

  const renderLevelSpells = (level) => (
    <div class="white-box mb-2 p-4">
      <h2 class="text-lg">{level} level</h2>
      <table class="w-full table first-column-full-width">
        <thead>
          <tr>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <For each={filteredSpells().filter((item) => item.level === level)}>
            {(spell) =>
              <tr>
                <td class="py-1">
                  <p>{spell.name}</p>
                  <Show when={manyActiveSpellClasses()}>
                    <p class="text-xs">{t(`classes.${spell.data.class}`)}</p>
                  </Show>
                </td>
                <td class="py-1">{spell.ready_to_use ? 'Cast' : ''}</td>
                <td class="py-1">{spell.comment}</td>
              </tr>
            }
          </For>
        </tbody>
      </table>
    </div>
  );

  const energyName = (value) => {
    if (value === 'monk') return t('terms.energy.monk');
  }

  const calculateCurrentLoad = () => {
    return pageState.characterItems.reduce((acc, item) => acc + item.quantity * item.weight, 0);
  }

  return (
    <div class="h-full flex flex-col">
      <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray-200">
        <div class="w-10"></div>
        <div class="flex-1 flex flex-col items-center">
          <p>{props.character.name}</p>
          <p class="text-sm">
            {t(`races.${props.character.decorated_data.race}`)} | {Object.entries(props.character.decorated_data.classes).map(([item, value]) => `${t(`classes.${item}`)} ${value}`).join(' * ')}
          </p>
        </div>
        <div class="w-10 h-8 p-2 flex flex-col justify-between cursor-pointer" onClick={openModal}>
          <p class="w-full border border-black"></p>
          <p class="w-full border border-black"></p>
          <p class="w-full border border-black"></p>
        </div>
      </div>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={pageState.activeTab === 'abilities'}>
            {renderAbility('str')}
            {renderAbility('dex')}
            {renderAbility('con')}
            {renderAbility('int')}
            {renderAbility('wis')}
            {renderAbility('cha')}
          </Match>
          <Match when={pageState.activeTab === 'combat'}>
            <div class="mb-2 p-4 flex white-box">
              {renderCombatStat(t('terms.armorClass'), combat().armor_class)}
              {renderCombatStat(t('terms.initiative'), modifier(combat().initiative))}
              {renderCombatStat(t('terms.speed'), combat().speed)}
            </div>
            <div class="mb-2 p-4 flex white-box">
              {renderCombatStat(t('terms.health'), combat().health.current)}
              {renderCombatStat(t('terms.maxHealth'), combat().health.max)}
              {renderCombatStat(t('terms.tempHealth'), combat().health.temp)}
            </div>
            {renderAttacksBox(`${t('terms.attackAction')} - ${combat().attacks_per_action}`, attacks().filter((item) => item.action_type === 'action'))}
            {renderAttacksBox(`${t('terms.attackBonusAction')} - 1`, attacks().filter((item) => item.action_type === 'bonus action'))}
            <div class="mb-2 p-4 flex white-box">
              <For each={Object.entries(props.character.decorated_data.energy)}>
                {([key, value]) =>
                  <p>{energyName(key)} - {value} / {props.character.decorated_data.max_energy}</p>
                }
              </For>
            </div>
            <For each={props.character.decorated_data.class_features}>
              {(class_feature) => <CollapseBox title={class_feature.title} description={class_feature.description} />}
            </For>
          </Match>
          <Match when={pageState.activeTab === 'equipment'}>
            <div class="mb-2 p-4 flex white-box">
              {renderCombatStat(t('equipment.gold'), props.character.decorated_data.coins.gold)}
              {renderCombatStat(t('equipment.silver'), props.character.decorated_data.coins.silver)}
              {renderCombatStat(t('equipment.copper'), props.character.decorated_data.coins.copper)}
            </div>
            <Show when={pageState.characterItems !== undefined}>
              {renderItemsBox(t('character.equipment'), pageState.characterItems.filter((item) => item.ready_to_use))}
              {renderItemsBox(t('character.backpack'), pageState.characterItems.filter((item) => !item.ready_to_use))}
              <div class="flex justify-end">
                <div class="p-4 flex white-box">
                  <p>{calculateCurrentLoad()} / {props.character.decorated_data.load}</p>
                </div>
              </div>
            </Show>
          </Match>
          <Match when={pageState.activeTab === 'spells'}>
            <Show when={pageState.characterSpells !== undefined}>
              <div class="flex justify-between items-center mb-2">
                <Checkbox
                  left
                  disabled={false}
                  labelText={t('character.onlyPreparedSpells')}
                  value={pageState.preparedSpellFilter}
                  onToggle={() => setPageState({ ...pageState, preparedSpellFilter: !pageState.preparedSpellFilter })}
                />
                <Show when={manyActiveSpellClasses()}>
                  <Select
                    classList="w-40"
                    items={props.character.decorated_data.spell_classes.reduce((acc, item) => { acc[item] = t(`classes.${item}`); return acc; }, { 'all': t('character.allSpells') })}
                    selectedValue={pageState.activeSpellClass}
                    onSelect={(value) => setPageState({ ...pageState, activeSpellClass: value })}
                  />
                </Show>
              </div>
              <For each={[0, 1]}>
                {(level) => renderLevelSpells(level)}
              </For>
            </Show>
          </Match>
          <Match when={pageState.activeTab === 'conditions'}>
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
        <p class="character-tab-select" onClick={() => changeTab('spells')}>{t('character.spells')}</p>
        <p class="character-tab-select" onClick={() => changeTab('conditions')}>{t('character.conditions')}</p>
      </Modal>
    </div>
  );
}
