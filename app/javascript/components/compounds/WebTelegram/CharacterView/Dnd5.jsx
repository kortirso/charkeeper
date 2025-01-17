import { Switch, Match, batch, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { CollapseBox } from '../../../../components';
import { createModal } from '../../../molecules';

import { useAppLocale } from '../../../../context';
import { capitalize, modifier } from '../../../../helpers';

export const Dnd5 = (props) => {
  const [pageState, setPageState] = createStore({
    activeTab: 'abilities'
  });

  const { Modal, openModal, closeModal } = createModal();
  const [_locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const characterItems = () => props.characterItems;
  const modifiers = () => props.character.show_data.modifiers;
  const savingThrows = () => props.character.show_data.saving_throws;
  const combat = () => props.character.show_data.combat;
  const attacks = () => props.character.show_data.attacks;
  const skills = () => props.character.show_data.skills;

  const changeTab = (value) => {
    batch(() => {
      setPageState({ ...pageState, activeTab: value });
      closeModal();
    });
  }

  const renderAbility = (ability) => (
    <div class="flex items-start mb-2">
      <div class="white-box flex flex-col items-center w-2/5 p-2">
        <p class="text-sm mb-1">{t(`abilities.${ability}`)} {props.character.show_data.abilities[ability]}</p>
        <p class="text-2xl mb-1">{modifier(modifiers()[ability])}</p>
      </div>
      <div class="w-3/5 pl-4">
        <div class="white-box p-2">
          <div class="flex justify-between">
            <p>{t('terms.savingThrows')}</p>
            <p>{modifier(savingThrows()[ability])}</p>
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

  const energyName = (value) => {
    if (value === 'monk') return 'Ki';
  }

  return (
    <div class="h-full flex flex-col">
      <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray-200">
        <div class="w-10"></div>
        <div class="flex-1 flex flex-col items-center">
          <p>{props.character.name}</p>
          <p class="text-sm">
            {t(`races.${props.character.show_data.race}`)} | {Object.entries(props.character.show_data.classes).map(([item, value]) => `${t(`classes.${item}`)} ${value}`).join(' * ')}
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
            <For each={props.character.show_data.class_features}>
              {(class_feature) => <CollapseBox title={class_feature.title} description={class_feature.description} />}
            </For>
          </Match>
          <Match when={pageState.activeTab === 'equipment'}>
            {renderItemsBox(t('character.equipment'), characterItems().filter((item) => item.ready_to_use))}
            {renderItemsBox(t('character.backpack'), characterItems().filter((item) => !item.ready_to_use))}
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>{t('character.abilities')}</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>{t('character.combat')}</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>{t('character.equipment')}</p>
      </Modal>
    </div>
  );
}
