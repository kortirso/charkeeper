# frozen_string_literal: true

describe CharactersContext::Dnd2024::MakeShortRestCommand do
  subject(:command_call) { instance.call({ character: Dnd2024::Character.find(character.id) }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, :dnd2024, data: {
      energy: { short_slug: 5, long_slug: 2 },
      spent_spell_slots: { 1 => 3, 2 => 1 },
      spent_hit_dice: { 'd6' => 0, 'd8' => 1, 'd10' => 2, 'd12' => 3 },
      health: { max: 10, current: 1 }
    }
  }

  before do
    create :dnd2024_character_feature, :bardic_inspiration, slug: 'long_slug'
    create :dnd2024_character_feature, :bardic_inspiration, slug: 'short_slug', limit_refresh: 'short_rest'
  end

  it 'updates some character data', :aggregate_failures do
    command_call

    data = character.reload.data

    expect(data.energy).to eq({ 'short_slug' => 0, 'long_slug' => 2 })
    expect(data.spent_spell_slots).to eq({ '1' => 3, '2' => 1 })
    expect(data.spent_hit_dice).to eq({ 'd6' => 0, 'd8' => 1, 'd10' => 2, 'd12' => 3 })
    expect(data.health).to eq({ 'max' => 10, 'current' => 1 })
  end
end
