# frozen_string_literal: true

describe CharactersContext::Dnd5::MakeLongRestCommand do
  subject(:command_call) { instance.call({ character: Dnd5::Character.find(character.id) }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, data: {
      energy: { slug: 5 },
      spent_spell_slots: { 1 => 3, 2 => 1 },
      spent_hit_dice: { 'd6' => 0, 'd8' => 1, 'd10' => 2, 'd12' => 3 },
      health: { max: 10, current: 1 }
    }
  }

  it 'updates character data', :aggregate_failures do
    command_call

    data = character.reload.data

    expect(data.energy).to eq({ 'slug' => 0 })
    expect(data.spent_spell_slots).to eq({ '1' => 0, '2' => 0 })
    expect(data.spent_hit_dice).to eq({ 'd6' => 0, 'd8' => 0, 'd10' => 1, 'd12' => 2 })
    expect(data.health).to eq({ 'max' => 10, 'current' => 10 })
  end
end
