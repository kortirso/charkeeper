# frozen_string_literal: true

describe CharactersContext::Dnd5::MakeShortRestCommand do
  subject(:command_call) do
    instance.call({ character: Dnd5::Character.find(character.id), options: options, make_rolls: make_rolls }.compact)
  end

  let(:instance) { described_class.new }
  let(:options) { nil }
  let(:make_rolls) { false }
  let!(:character) {
    create :character, data: {
      energy: { short_slug: 5, long_slug: 2 },
      spent_spell_slots: { 1 => 3, 2 => 1 },
      spent_hit_dice: { '6' => 0, '8' => 1, '10' => 2, '12' => 3 },
      hit_dice: { '6' => 2, '8' => 1, '10' => 2, '12' => 3 },
      health: { max: 10, current: 1 }
    }
  }
  let!(:feat1) { create :feat, :dnd5_bardic_inspiration }
  let!(:feat2) { create :feat, :dnd5_bardic_inspiration, limit_refresh: 'short_rest' }
  let!(:character_feat1) { create :character_feat, feat: feat1, character: character, used_count: 2, limit_refresh: 1 }
  let!(:character_feat2) { create :character_feat, feat: feat2, character: character, used_count: 5, limit_refresh: 0 }

  it 'updates some character data', :aggregate_failures do
    command_call

    data = character.reload.data

    expect(character_feat1.reload.used_count).to eq 2
    expect(character_feat2.reload.used_count).to eq 0
    expect(data.spent_spell_slots).to eq({ '1' => 3, '2' => 1 })
    expect(data.spent_hit_dice).to eq({ '6' => 0, '8' => 1, '10' => 2, '12' => 3 })
    expect(data.health).to eq({ 'max' => 10, 'current' => 1 })
  end

  context 'with rolls' do
    let(:options) { { 'd6' => 1, 'd8' => 0, 'd10' => 0, 'd12' => 0 } }
    let(:make_rolls) { true }

    it 'updates some character data', :aggregate_failures do
      command_call

      data = character.reload.data

      expect(character_feat1.reload.used_count).to eq 2
      expect(character_feat2.reload.used_count).to eq 0
      expect(data.spent_spell_slots).to eq({ '1' => 3, '2' => 1 })
      expect(data.spent_hit_dice).to eq({ '6' => 1, '8' => 1, '10' => 2, '12' => 3 })
      expect(data.health['current']).not_to eq 1
      expect(data.health['current']).not_to eq 0
    end
  end

  context 'with too many rolls' do
    let(:options) { { 'd6' => 3, 'd8' => 0, 'd10' => 0, 'd12' => 0 } }
    let(:make_rolls) { true }

    it 'updates some character data', :aggregate_failures do
      command_call

      data = character.reload.data

      expect(character_feat1.reload.used_count).to eq 2
      expect(character_feat2.reload.used_count).to eq 0
      expect(data.spent_spell_slots).to eq({ '1' => 3, '2' => 1 })
      expect(data.spent_hit_dice).to eq({ '6' => 2, '8' => 1, '10' => 2, '12' => 3 })
      expect(data.health['current']).not_to eq 1
      expect(data.health['current']).not_to eq 0
    end
  end
end
