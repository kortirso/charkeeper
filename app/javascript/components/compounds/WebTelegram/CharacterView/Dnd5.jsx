import { capitalize } from '../../../../helpers';

export const Dnd5 = (props) => {
  const character = () => props.character;
  const abilities = () => props.character.represented_data.abilities;
  const savingThrows = () => props.character.represented_data.saving_throws;

  const renderAbility = (title, ability, isFirstLine=false) => (
    <div class={`w-1/3 flex flex-col items-center ${isFirstLine ? 'mb-6' : ''}`}>
      <p class="uppercase text-sm mb-1">{title}</p>
      <p class="text-2xl mb-1">{ability.modifier > 0 ? `+${ability.modifier}` : ability.modifier}</p>
      <p class="text-sm">{ability.value}</p>
    </div>
  );

  const renderSavingThrow = (title, value) => (
    <div class="flex justify-between items-center mb-1">
      <p class="text-sm">{title}</p>
      <p class="text-lg">{value > 0 ? `+${value}` : value}</p>
    </div>
  );

  return (
    <div>
      <div class="w-full flex justify-between mb-4 py-4 border-b border-gray">
        <div class="flex-1 flex flex-col items-center">
          <p>{character().name}</p>
          <p class="text-sm">
            {capitalize(character().data.race)} | {Object.keys(character().data.classes).map((item) => capitalize(item)).join(' * ')}
          </p>
        </div>
      </div>
      <div class="p-4 flex flex-wrap border-b border-gray">
        {renderAbility('Strength', abilities().str, true)}
        {renderAbility('Dexterity', abilities().dex, true)}
        {renderAbility('Constitution', abilities().con, true)}
        {renderAbility('Intelligence', abilities().int)}
        {renderAbility('Wisdom', abilities().wis)}
        {renderAbility('Charisma', abilities().cha)}
      </div>
      <h2 class="pt-4 px-8 text-xl">Saving throws</h2>
      <div class="p-4 flex border-b border-gray">
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
  );
}
