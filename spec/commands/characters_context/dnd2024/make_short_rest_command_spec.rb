# frozen_string_literal: true

describe CharactersContext::Dnd2024::MakeShortRestCommand do
  subject(:command_call) { instance.call({ character: Dnd2024::Character.find(character.id) }) }

  let(:instance) { described_class.new }
  let!(:character) {
    create :character, :dnd2024, data: {
      spent_spell_slots: { 1 => 3, 2 => 1 },
      spent_hit_dice: { 'd6' => 0, 'd8' => 1, 'd10' => 2, 'd12' => 3 },
      health: { max: 10, current: 1 }
    }
  }
  let!(:feat1) { create :feat, :dnd2024_bardic_inspiration }
  let!(:feat2) { create :feat, :dnd2024_bardic_inspiration, limit_refresh: 'short_rest' }
  let!(:feat3) { create :feat, :dnd2024_bardic_inspiration, limit_refresh: 'one_at_short_rest' }
  let!(:character_feat1) { create :character_feat, feat: feat1, character: character, used_count: 2, limit_refresh: 1 }
  let!(:character_feat2) { create :character_feat, feat: feat2, character: character, used_count: 5, limit_refresh: 0 }
  let!(:character_feat3) { create :character_feat, feat: feat3, character: character, used_count: 2, limit_refresh: 2 }

  it 'updates some character data', :aggregate_failures do
    command_call

    data = character.reload.data

    expect(character_feat1.reload.used_count).to eq 2
    expect(character_feat2.reload.used_count).to eq 0
    expect(character_feat3.reload.used_count).to eq 1
    expect(data.spent_spell_slots).to eq({ '1' => 3, '2' => 1 })
    expect(data.spent_hit_dice).to eq({ 'd6' => 0, 'd8' => 1, 'd10' => 2, 'd12' => 3 })
    expect(data.health).to eq({ 'max' => 10, 'current' => 1 })
  end
end
