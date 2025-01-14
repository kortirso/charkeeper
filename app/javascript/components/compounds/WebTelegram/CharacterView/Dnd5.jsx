import { Switch, Match, batch, For } from 'solid-js';
import { createStore } from 'solid-js/store';

import { createModal } from '../../../molecules';

import { capitalize, modifier } from '../../../../helpers';

export const Dnd5 = (props) => {
  const [pageState, setPageState] = createStore({
    activeTab: 'abilities'
  });

  const { Modal, openModal, closeModal } = createModal();

  const character = () => props.character;
  const abilities = () => props.character.represented_data.abilities;
  const savingThrows = () => props.character.represented_data.saving_throws;
  const skills = () => props.character.represented_data.skills;

  const changeTab = (value) => {
    batch(() => {
      setPageState({ ...pageState, activeTab: value });
      closeModal();
    })
  }

  const renderAbility = (title, ability, isFirstLine=false) => (
    <div class={`w-1/3 flex flex-col items-center ${isFirstLine ? 'mb-6' : ''}`}>
      <p class="uppercase text-sm mb-1">{title}</p>
      <p class="text-2xl mb-1">{modifier(ability.modifier)}</p>
      <p class="text-sm">{ability.value}</p>
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
      <div class="w-full flex justify-between items-center py-4 px-2 bg-white border-b border-gray">
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
      <Switch>
        <Match when={pageState.activeTab === 'abilities'}>
          <div class="flex-1 overflow-y-scroll p-4">
            <div class="mb-4 p-4 flex flex-wrap bg-white border border-gray rounded">
              {renderAbility('Strength', abilities().str, true)}
              {renderAbility('Dexterity', abilities().dex, true)}
              {renderAbility('Constitution', abilities().con, true)}
              {renderAbility('Intelligence', abilities().int)}
              {renderAbility('Wisdom', abilities().wis)}
              {renderAbility('Charisma', abilities().cha)}
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
          </div>
        </Match>
        <Match when={pageState.activeTab === 'skills'}>
          <div class="p-4 flex-1 overflow-y-scroll">
            <div class="p-4 bg-white border border-gray rounded">
              <table class="w-full">
                <thead>
                  <tr>
                    <td class="uppercase text-center pb-1 text-sm">Prof</td>
                    <td class="uppercase text-center pb-1 text-sm">Ability</td>
                    <td class="uppercase pb-1 text-sm">Skill</td>
                    <td class="uppercase text-center pb-1 text-sm">Bonus</td>
                  </tr>
                </thead>
                <tbody>
                  <For each={Object.keys(skills())}>
                    {(skill) =>
                      <tr class="border-b border-gray">
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
          </div>
        </Match>
      </Switch>
      <Modal>
        <p class="cursor-pointer" onClick={() => changeTab('abilities')}>Abilities</p>
        <p class="cursor-pointer" onClick={() => changeTab('skills')}>Skills</p>
        <p class="cursor-pointer" onClick={() => changeTab('combat')}>Combat</p>
        <p class="cursor-pointer" onClick={() => changeTab('inventory')}>Inventory</p>
      </Modal>
    </div>
  );
}
