import { Switch, Match, batch, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';

import { createModal } from '../../../molecules';

import { capitalize, modifier } from '../../../../helpers';

export const Dnd5 = (props) => {
  const [pageState, setPageState] = createStore({
    activeTab: 'abilities'
  });

  const { Modal, openModal, closeModal } = createModal();

  const character = () => props.character;
  const characterItems = () => props.characterItems;
  const data = () => props.character.data;
  const modifiers = () => props.character.represented_data.modifiers;
  const savingThrows = () => props.character.represented_data.saving_throws;
  const skills = () => props.character.represented_data.skills;
  const combat = () => props.character.represented_data.combat;
  const attacks = () => props.character.represented_data.attacks;

  const changeTab = (value) => {
    batch(() => {
      setPageState({ ...pageState, activeTab: value });
      closeModal();
    });
  }

  const renderAbility = (title, ability, isFirstLine=false) => (
    <div class={`w-1/3 flex flex-col items-center ${isFirstLine ? 'mb-6' : ''}`}>
      <p class="uppercase text-sm mb-1">{title}</p>
      <p class="text-2xl mb-1">{modifier(modifiers()[ability])}</p>
      <p class="text-sm">{data().abilities[ability]}</p>
    </div>
  );

  const renderSavingThrow = (title, value) => (
    <div class="flex justify-between items-center mb-1">
      <p class="text-sm">{title}</p>
      <p class="text-lg">{modifier(value)}</p>
    </div>
  );

  return (
    <div class="h-full flex flex-col">
      <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray-200">
        <div class="w-10"></div>
        <div class="flex-1 flex flex-col items-center">
          <p>{character().name}</p>
          <p class="text-sm">
            {capitalize(character().data.race)} | {Object.keys(character().data.classes).map((item) => capitalize(item)).join(' * ')}
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
            <div class="mb-4 p-4 flex flex-wrap white-box">
              {renderAbility('Strength', 'str', true)}
              {renderAbility('Dexterity', 'dex', true)}
              {renderAbility('Constitution', 'con', true)}
              {renderAbility('Intelligence', 'int')}
              {renderAbility('Wisdom', 'wis')}
              {renderAbility('Charisma', 'cha')}
            </div>
            <div class="p-4 bg-white border border-gray rounded">
              <h2 class="text-xl px-4 mb-2">Saving throws</h2>
              <div class="flex">
                <div class="flex-1 flex flex-col px-4">
                  {renderSavingThrow('Strength', savingThrows().str)}
                  {renderSavingThrow('Dexterity', savingThrows().dex)}
                  {renderSavingThrow('Constitution', savingThrows().con)}
                </div>
                <div class="flex-1 flex flex-col px-4">
                  {renderSavingThrow('Intelligence', savingThrows().int)}
                  {renderSavingThrow('Wisdom', savingThrows().wis)}
                  {renderSavingThrow('Charisma', savingThrows().cha)}
                </div>
              </div>
            </div>
          </Match>
          <Match when={pageState.activeTab === 'skills'}>
            <div class="p-4 white-box">
              <table class="w-full table">
                <thead>
                  <tr>
                    <td class="text-center">Prof</td>
                    <td class="text-center">Ability</td>
                    <td>Skill</td>
                    <td class="text-center">Bonus</td>
                  </tr>
                </thead>
                <tbody>
                  <For each={Object.keys(skills())}>
                    {(skill) =>
                      <tr>
                        <td class="py-1 text-center"></td>
                        <td class="py-1 text-center uppercase">{skills()[skill].ability}</td>
                        <td class="py-1">{capitalize(skill)}</td>
                        <td class="py-1 text-center">{modifier(skills()[skill].modifier)}</td>
                      </tr>
                    }
                  </For>
                </tbody>
              </table>
            </div>
          </Match>
          <Match when={pageState.activeTab === 'equipment'}>
            <div class="p-4 white-box mb-4">
              <h2 class="text-lg">Equipment</h2>
              <table class="w-full table">
                <thead>
                  <tr>
                    <td></td>
                    <td class="text-center">Qty</td>
                    <td class="text-center">Weight</td>
                    <td class="text-center">Cost</td>
                  </tr>
                </thead>
                <tbody>
                  <For each={characterItems().filter((item) => item.ready_to_use)}>
                    {(characterItem) =>
                      <tr>
                        <td class="py-1">
                          <p>{characterItem.name.en}</p>
                          <p class="text-xs">{characterItem.kind}</p>
                        </td>
                        <td class="py-1 text-center">{characterItem.quantity}</td>
                        <td class="py-1 text-center">{characterItem.weight * characterItem.quantity}</td>
                        <td class="py-1 text-center">{characterItem.quantity * characterItem.price / 100}</td>
                      </tr>
                    }
                  </For>
                </tbody>
              </table>
            </div>
            <div class="p-4 white-box">
              <h2 class="text-lg">Backpack</h2>
              <table class="w-full table">
                <thead>
                  <tr>
                    <td></td>
                    <td class="text-center">Qty</td>
                    <td class="text-center">Weight</td>
                    <td class="text-center">Cost</td>
                  </tr>
                </thead>
                <tbody>
                  <For each={characterItems().filter((item) => !item.ready_to_use)}>
                    {(characterItem) =>
                      <tr>
                        <td class="py-1">
                          <p>{characterItem.name.en}</p>
                          <p class="text-xs">{characterItem.kind}</p>
                        </td>
                        <td class="py-1 text-center">{characterItem.quantity}</td>
                        <td class="py-1 text-center">{characterItem.weight * characterItem.quantity}</td>
                        <td class="py-1 text-center">{characterItem.quantity * characterItem.price / 100}</td>
                      </tr>
                    }
                  </For>
                </tbody>
              </table>
            </div>
          </Match>
          <Match when={pageState.activeTab === 'combat'}>
            <div class="mb-4 p-4 flex white-box">
              <div class="w-1/3 flex flex-col items-center">
                <p class="uppercase text-sm mb-1">Armor class</p>
                <p class="text-2xl mb-1">{combat().armor_class}</p>
              </div>
              <div class="w-1/3 flex flex-col items-center">
                <p class="uppercase text-sm mb-1">Initiative</p>
                <p class="text-2xl mb-1">{modifier(combat().initiative)}</p>
              </div>
              <div class="w-1/3 flex flex-col items-center">
                <p class="uppercase text-sm mb-1">Speed</p>
                <p class="text-2xl mb-1">{combat().speed}</p>
              </div>
            </div>
            <div class="p-4 white-box mb-4">
              <h2 class="text-lg">Attacks</h2>
              <table class="w-full table">
                <thead>
                  <tr>
                    <td></td>
                    <td class="text-center">Bonus</td>
                    <td class="text-center">Damage</td>
                    <td class="text-center">Dist</td>
                  </tr>
                </thead>
                <tbody>
                  <For each={attacks()}>
                    {(attack) =>
                      <tr>
                        <td class="py-1">
                          <p>{attack.name}</p>
                          <Show when={attack.hands == 2}><p class="text-xs">With two hands</p></Show>
                        </td>
                        <td class="py-1 text-center">{modifier(attack.attack_bonus)}</td>
                        <td class="py-1 text-center">
                          <p>{attack.damage}{modifier(attack.damage_bonus)}</p>
                          <p class="text-xs">{attack.damage_type}</p>
                        </td>
                        <td class="py-1 text-center">
                          <Show when={attack.melee_distance}><p>{attack.melee_distance}</p></Show>
                          <Show when={attack.range_distance}><p>{attack.range_distance}</p></Show>
                        </td>
                      </tr>
                    }
                  </For>
                </tbody>
              </table>
            </div>
          </Match>
        </Switch>
      </div>
      <Modal>
        <p class="character-tab-select" onClick={() => changeTab('abilities')}>Abilities</p>
        <p class="character-tab-select" onClick={() => changeTab('skills')}>Skills</p>
        <p class="character-tab-select" onClick={() => changeTab('equipment')}>Equipment</p>
        <p class="character-tab-select" onClick={() => changeTab('combat')}>Combat</p>
      </Modal>
    </div>
  );
}
