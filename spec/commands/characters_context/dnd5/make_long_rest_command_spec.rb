# frozen_string_literal: true

describe CharactersContext::Dnd5::MakeLongRestCommand do
  subject(:command_call) { instance.call({ character: Dnd5::Character.find(character.id) }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, data: {
      spent_spell_slots: { 1 => 3, 2 => 1 },
      hit_dice: { '6' => 0, '8' => 2, '10' => 4, '12' => 4 },
      spent_hit_dice: { '6' => 0, '8' => 1, '10' => 2, '12' => 3 },
      health: { max: 10, current: 1 }
    }
  }

  it 'updates character data', :aggregate_failures do
    command_call

    data = character.reload.data

    expect(data.spent_spell_slots).to eq({ '1' => 0, '2' => 0 })
    expect(data.spent_hit_dice).to eq({ '6' => 0, '8' => 0, '10' => 0, '12' => 1 })
    expect(data.health).to eq({ 'max' => 10, 'current' => 10 })
  end
end
